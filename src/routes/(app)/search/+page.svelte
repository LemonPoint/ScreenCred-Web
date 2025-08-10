<script lang="ts">
	import DebounceInput from '$lib/components/DebounceInput.svelte';
	import { onMount } from 'svelte';
	import type { PagedResponse } from '$lib/interfaces.js';
	import type { MediaDetails } from '$lib/interfaces.js';
	import type { MovieDetails } from '$lib/interfaces.js';
	import type { TVDetails } from '$lib/interfaces.js';
	import type { PersonDetails } from '$lib/interfaces.js';
	import { recentSearches, updateComparison, updateRecentSearches } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { mediaSubtitle, mediaTitle } from '$lib/utils';
	import Poster from '$lib/components/Poster.svelte';
	import { page } from '$app/state';
	import z from 'zod';

	let query = $state('');
	let abortController: AbortController | null = null;
	let searchResults: MediaDetails[] = $state([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	let popular = $state<{ movies: MovieDetails[]; tvShows: TVDetails[]; people: PersonDetails[] }>({
		movies: [],
		tvShows: [],
		people: []
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
	});

	async function handleSearch(query: string) {
		abortController?.abort();

		if (!query.trim()) {
			searchResults = [];
			error = null;
			isLoading = false;
			return;
		}

		abortController = new AbortController();
		await search(query, abortController.signal);
	}

	async function search(query: string, signal?: AbortSignal) {
		if (!query.trim()) {
			searchResults = [];
			return;
		}

		isLoading = true;
		error = null;

		try {
			const url = new URL('/api/search', window.location.origin);
			url.searchParams.set('query', query);
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json'
				},
				signal
			});

			if (!response.ok) {
				error = `Search failed: ${response.status}`;
				return;
			}

			const data = (await response.json()) as { results: MediaDetails[] };

			if (!signal?.aborted) {
				searchResults = data.results || [];
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}

			if (!signal?.aborted) {
				error = err instanceof Error ? err.message : 'Search failed';
				searchResults = [];
			}
		} finally {
			if (!signal?.aborted) {
				isLoading = false;
				abortController = null;
			}
		}
	}

	async function selectMedia(media: MediaDetails) {
		const schema = z.enum(['first', 'second']).catch('first');
		const forWhich = schema.parse(page.url.searchParams.get('for'));
		const completedComparison = updateComparison({ [forWhich]: media });
		if (completedComparison) {
			if (completedComparison.first && completedComparison.second) {
				updateRecentSearches([completedComparison.first, completedComparison.second]);
			}
			await Promise.all([
				fetch(`/search/${completedComparison.id}`, { method: 'POST' }),
				goto(`/search/${completedComparison.id}`)
			]);
		} else if (forWhich === 'first') {
			await goto(`/search?for=second`);
		}
	}

	$effect(() => {
		return () => {
			abortController?.abort();
		};
	});
</script>

<div class="search">
	<DebounceInput
		bind:value={query}
		placeholder="Search movies, TV shows, people..."
		onSearch={handleSearch}
	/>
	<span class="icon magnifying-glass"></span>
</div>

{#snippet Section({ title, type, media })}
	<section class="popular">
		<header>
			<h3><span class={['icon', type]}></span>{title}</h3>
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

{#if isLoading}
	<p>Searching...</p>
{:else if error}
	<p>Error: {error}</p>
{:else if searchResults.length > 0}
	{@render Section({ title: 'Search', type: 'magnifying-glass', media: searchResults })}
{:else if query.trim() && recentSearches.value.length === 0}
	<p>No results found</p>
{/if}

{#if recentSearches.value.length > 0}
	{@render Section({ title: 'Recent', type: 'history', media: recentSearches.value })}
{/if}
{@render Section({ title: 'Trending Movies', type: 'movie', media: popular.movies })}
{@render Section({ title: 'Trending Shows', type: 'tv', media: popular.tvShows })}
{@render Section({ title: 'Trending People', type: 'person', media: popular.people })}

<style>
	.search {
		width: 100%;
		padding-block: 2rem;
		position: relative;
		font-size: 1.5rem;

		.icon {
			position: absolute;
			right: 1rem;
			top: 50%;
			transform: translateY(-50%);
			color: var(--uchu-gray-8);
		}
	}

	ul {
		padding: 0;
		display: flex;
		flex-direction: row;
		gap: 1rem;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;

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

		h3 {
			color: white;
			display: flex;
			align-items: center;
			gap: 0.25em;
			font-weight: 500;
		}
	}

	.popular {
		margin-top: 2rem;
	}
</style>
