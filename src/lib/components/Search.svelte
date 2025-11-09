<script lang="ts">
	import type {
		MediaDetails,
		MovieDetails,
		PagedResponse,
		PersonDetails,
		TVDetails
	} from '$lib/interfaces';
	import { onMount } from 'svelte';
	import SearchInput from './SearchInput.svelte';
	import { mediaSubtitle, mediaTitle } from '$lib/utils';
	import Poster from './Poster.svelte';
	import { error, isLoading, query, resetSearch, searchResults } from '$lib/search.svelte';
	import { recentSearches, updateComparison, updateRecentSearches } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let popular = $state<{ movies: MovieDetails[]; tvShows: TVDetails[]; people: PersonDetails[] }>({
		movies: [],
		tvShows: [],
		people: []
	});

	let dialogRef: HTMLDialogElement | null = null;

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
	});

	export function start() {
		resetSearch();
		dialogRef?.showModal();
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
		dialogRef?.close();
	}

	// $effect(() => {
	// 	return () => {
	// 		abortController?.abort();
	// 	};
	// });
</script>

<dialog bind:this={dialogRef}>
	<header class="search-header">
		<form method="dialog">
			<button aria-label="Close Search"> Close </button>
		</form>
		<SearchInput />
	</header>

	{#snippet Section({ title, type, media }: { title: string; type: string; media: MediaDetails[] })}
		<section class="popular">
			<header>
				<h2><span class={['icon', type]}></span>{title}</h2>
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
		<p>Searching...</p>
	{:else if error()}
		<p>Error: {error()}</p>
	{:else if searchResults().length > 0}
		{@render Section({ title: 'Search', type: 'magnifying-glass', media: searchResults() })}
	{:else if query.current.trim() && searchResults().length === 0}
		<p>No results found</p>
	{/if}

	{#if recentSearches.value.length > 0}
		{@render Section({ title: 'Recent Searches', type: 'history', media: recentSearches.value })}
	{/if}

	{@render Section({ title: 'Trending Movies', type: 'movie', media: popular.movies })}
	{@render Section({ title: 'Trending Shows', type: 'tv', media: popular.tvShows })}
	{@render Section({ title: 'Trending People', type: 'person', media: popular.people })}
</dialog>

<style>
	dialog {
		padding: 0;
		margin: var(--body-padding-inline);
		border: none;
		background: none;
		backdrop-filter: blur(30px) brightness(0.4);
		width: calc(100vw - var(--body-padding-inline));
		max-height: 900px;
		max-width: 900px;
		margin: auto;
		border-radius: 10px;
		overflow: auto;
		box-shadow: var(--shadow-5);

		@media (width <= 40rem) {
			max-height: none;
			height: calc(100dvh - 100px);
			width: 100vw;
			margin: 0;
			margin-top: 100px;
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

	form[method='dialog'] button {
		background: none;
		color: var(--uchu-gray-1);
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 999px;
		font-size: 1.25em;
		border: none;
	}

	ul {
		padding-inline: var(--body-padding-inline);
		display: flex;
		flex-direction: row;
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
		}
	}

	.popular {
		margin-top: 2rem;
	}
</style>
