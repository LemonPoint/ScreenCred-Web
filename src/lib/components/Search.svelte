<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type {
		MediaDetails,
		MovieDetails,
		PagedResponse,
		PersonDetails,
		TVDetails
	} from '$lib/interfaces';
	import { error, isLoading, query, resetSearch, searchResults } from '$lib/search.svelte';
	import { recentSearches, updateComparison, updateRecentSearches } from '$lib/store.svelte';
	import { mediaSubtitle, mediaTitle } from '$lib/utils';
	import slugify from '@sindresorhus/slugify';
	import { onDestroy, onMount } from 'svelte';
	import Poster from './Poster.svelte';
	import SearchInput from './SearchInput.svelte';

	let popular = $state<{ movies: MovieDetails[]; tvShows: TVDetails[]; people: PersonDetails[] }>({
		movies: [],
		tvShows: [],
		people: []
	});

	let dialogRef: HTMLDialogElement | null = null;
	let closing = $state(false);
	let clickHandler: ((e: MouseEvent) => void) | null = null;

	$effect(() => {
		searchResults();
		const search = document.getElementById('search');
		search?.scrollIntoView({ behavior: 'smooth' });
	});

	onMount(async () => {
		const response = await fetch('/api/popular', {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data: PagedResponse<MediaDetails>[] = await response.json();
		const [movies, tvShows, people] = data.map((r) => r.results);
		popular = {
			movies: movies as MovieDetails[],
			tvShows: tvShows as TVDetails[],
			people: people as PersonDetails[]
		};

		dialogRef?.addEventListener('close', resetSearch);

		dialogRef?.addEventListener('cancel', (e) => {
			e.preventDefault();
			startClosingAnimation();
		});
	});

	function startClosingAnimation() {
		if (closing) {
			return;
		}

		closing = true;

		dialogRef?.addEventListener(
			'animationend',
			() => {
				closing = false;
				dialogRef?.close();
			},
			{ once: true }
		);
	}

	export function start() {
		resetSearch();
		if (dialogRef) {
			dialogRef.showModal();
			dialogRef.scrollTop = 0;

			if (clickHandler) {
				dialogRef.removeEventListener('click', clickHandler);
			}

			clickHandler = (e) => {
				if (e.target === dialogRef) {
					startClosingAnimation();
				}
			};
			dialogRef.addEventListener('click', clickHandler);
		}
	}

	async function selectMedia(media: MediaDetails) {
		const completedComparison = updateComparison({ [query.forWhich]: media });
		if (completedComparison) {
			if (completedComparison.first && completedComparison.second) {
				updateRecentSearches([completedComparison.first, completedComparison.second]);
			}
			const searchId = completedComparison.id!;
			await Promise.all([
				fetch(`/search/${completedComparison.id}`, { method: 'POST' }),
				goto(resolve('/(app)/search/[searchId]', { searchId }), {})
			]);
		}
		resetSearch();
		requestAnimationFrame(() => {
			startClosingAnimation();
		});
	}

	onDestroy(() => {
		if (dialogRef) {
			dialogRef.removeEventListener('close', resetSearch);
			if (clickHandler) {
				dialogRef.removeEventListener('click', clickHandler);
			}
		}
	});
</script>

<dialog bind:this={dialogRef} class:closing>
	<header class="search-header">
		<button aria-label="Close Search" onclick={startClosingAnimation}> Close </button>
		<SearchInput />
	</header>

	{#snippet Section({ title, type, media }: { title: string; type: string; media: MediaDetails[] })}
		<section class="popular">
			<header>
				<h2 id={slugify(title)}><span class={['icon', type]}></span>{title}</h2>
			</header>
			<ul role="list">
				{#each media as media (media.id)}
					{@const title = mediaTitle(media)}
					{@const subtitle = mediaSubtitle(media, navigator.language)}
					<li>
						<button
							onclick={() => {
								selectMedia(media);
							}}
						>
							<div class="poster">
								<Poster {media} />
							</div>
							<div class="metadata">
								<h4 class="title">{title}</h4>
								<p class="subtitle">{subtitle}</p>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/snippet}

	{#if isLoading()}
		<p class="search-state">Searching...</p>
	{:else if error()}
		<p class="search-state">Error: {error()}</p>
	{:else if (searchResults()?.length ?? 0) > 0}
		{@render Section({ title: 'Search', type: 'magnifying-glass', media: searchResults()! })}
	{:else if query.current.trim() && searchResults()?.length === 0}
		<p class="search-state">No results found</p>
	{/if}

	{#if recentSearches.value.length > 0}
		{@render Section({ title: 'Recent Searches', type: 'history', media: recentSearches.value })}
	{/if}

	{@render Section({ title: 'Trending Movies', type: 'movie', media: popular.movies })}
	{@render Section({ title: 'Trending Shows', type: 'tv', media: popular.tvShows })}
	{@render Section({ title: 'Trending People', type: 'person', media: popular.people })}
</dialog>

<style>
	@keyframes dialogClose {
		to {
			opacity: 0;
			transform: scale(0.8);
		}
	}

	dialog {
		padding: 0;
		border: none;
		background: none;
		backdrop-filter: blur(30px) brightness(0.4);
		width: calc(100vw - var(--body-padding-inline));
		height: calc(100vh - var(--body-padding-inline));
		max-height: 900px;
		max-width: 900px;
		margin: auto;
		border-radius: 10px;
		overflow: auto;
		box-shadow: var(--shadow-5);
		transform-origin: top;
		--_transition-speed: 500ms;
		transition:
			opacity var(--_transition-speed) var(--spring-1),
			transform var(--_transition-speed) var(--spring-1),
			display var(--_transition-speed) var(--spring-1) allow-discrete;
		opacity: 0;
		transform: scale(0.8);

		&::backdrop {
			background: none;
		}

		&[open] {
			opacity: 1;
			transform: scale(1);

			@starting-style {
				opacity: 0;
				transform: scale(0.8);
			}
		}

		&.closing {
			animation: dialogClose var(--_transition-speed) var(--spring-1) forwards;
		}

		@media (width <= 40rem) {
			max-height: none;
			height: 100vh;
			width: 100vw;
			margin: 0;
		}
	}

	header.search-header {
		padding-top: 1rem;
		padding-bottom: 2rem;
		padding-inline: var(--body-padding-inline);
		width: 100%;
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--uchu-yin-9);
		box-shadow: var(--shadow-3);
		display: flex;
		flex-direction: column;
		gap: 1em;
		align-items: end;
	}

	button {
		background: none;
		color: var(--uchu-gray-1);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.25em;
		border: none;
		outline: none;
		border-radius: 2px;
		cursor: pointer;

		&:focus-visible {
			outline: 1px solid white;
		}
	}

	ul {
		padding-inline: var(--body-padding-inline);
		display: flex;
		flex-direction: row;
		align-items: start;
		gap: 1rem;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--body-padding-inline);

		&::-webkit-scrollbar {
			display: none;
		}
	}

	li {
		display: flex;

		button {
			background: transparent;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
			cursor: pointer;
			border: none;
			width: min-content;
			padding: 0;

			.poster {
				width: 140px;
			}

			.metadata {
				width: 100%;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				text-align: start;
				color: white;
				gap: 0.25rem;

				h4 {
					display: -webkit-box;
					line-clamp: 2;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}

				p {
					color: var(--uchu-gray-5);
					display: -webkit-box;
					line-clamp: 2;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
			}
		}
	}

	header {
		margin-bottom: 1rem;

		h2 {
			color: white;
			display: flex;
			align-items: center;
			gap: 0.25em;
			font-weight: 500;
			padding-inline-start: var(--body-padding-inline);
			scroll-margin-block-start: 150px;
		}
	}

	.popular {
		margin-top: 2rem;
	}

	.search-state {
		color: white;
		padding: var(--body-padding-inline);
	}
</style>
