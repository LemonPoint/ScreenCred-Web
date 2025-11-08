<script lang="ts">
	import DebounceInput from '$lib/components/DebounceInput.svelte';
	import { onMount } from 'svelte';
	import type { MediaType, PagedResponse } from '$lib/interfaces.js';
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
	import { mediaImage } from '$lib/utils.js';
	import { resolve } from '$app/paths';

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
				const lowercasedQuery = query.toLowerCase();
				const results = data.results || [];
				const sortedResults = results.sort((a, b) => {
					const lhsName = mediaTitle(a).toLowerCase();
					const rhsName = mediaTitle(b).toLowerCase();

					if (a.mediaType === 'person' && mediaImage(a) === null) {
						return 1; // a comes after b
					} else if (b.mediaType === 'person' && mediaImage(b) === null) {
						return -1; // a comes before b
					} else if (lhsName === rhsName) {
						return b.popularity - a.popularity; // higher popularity first
					} else if (lhsName === lowercasedQuery) {
						return -1; // a comes before b (exact match priority)
					} else if (rhsName === lowercasedQuery) {
						return 1; // a comes after b (exact match priority)
					} else if (!lhsName.includes(lowercasedQuery)) {
						return 1; // a comes after b (doesn't contain query)
					} else if (!rhsName.includes(lowercasedQuery)) {
						return -1; // a comes before b (contains query)
					} else {
						return b.popularity - a.popularity; // higher popularity first
					}
				});
				searchResults = sortedResults;
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
			const searchId = completedComparison.id!;
			await Promise.all([
				fetch(`/search/${completedComparison.id}`, { method: 'POST' }),
				goto(resolve('/(app)/search/[searchId]', { searchId }), {})
			]);
		} else if (forWhich === 'first') {
			searchResults = [];
			query = '';
			const path = resolve('/(app)/search');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(`${path}?for=second`, {});
		}
	}

	$effect(() => {
		return () => {
			abortController?.abort();
		};
	});
</script>

<div class="search-wrapper">
	<div class="search">
		<DebounceInput
			bind:value={query}
			placeholder="Search movies, TV shows, people..."
			onSearch={handleSearch}
		/>
		<span class="icon magnifying-glass"></span>
	</div>
</div>

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

{#if isLoading}
	<p>Searching...</p>
{:else if error}
	<p>Error: {error}</p>
{:else if searchResults.length > 0}
	{@render Section({ title: 'Search', type: 'magnifying-glass', media: searchResults })}
{:else if query.trim() && searchResults.length === 0}
	<p>No results found</p>
{/if}

{#if recentSearches.value.length > 0}
	{@render Section({ title: 'Recent Searches', type: 'history', media: recentSearches.value })}
{/if}
{@render Section({ title: 'Trending Movies', type: 'movie', media: popular.movies })}
{@render Section({ title: 'Trending Shows', type: 'tv', media: popular.tvShows })}
{@render Section({ title: 'Trending People', type: 'person', media: popular.people })}

<style>
	.search-wrapper {
		position: fixed;
		display: flex;
		align-items: end;
		width: 100vw;
		height: 100dvh;
		top: 0;
		padding-block: 2rem;
		padding-inline: var(--body-padding-inline);
		z-index: 100;
	}
	.search {
		width: 100%;
		max-width: 900px;
		margin-inline: auto;
		font-size: clamp(1rem, 2vw, 1.5rem);
		position: relative;

		.icon {
			position: absolute;
			right: 1rem;
			top: 50%;
			transform: translateY(-50%);
			color: var(--uchu-gray-8);
		}
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
