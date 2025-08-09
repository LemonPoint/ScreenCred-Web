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
	let results: MediaDetails[] = $state([]);
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
			results = [];
			error = null;
			isLoading = false;
			return;
		}

		abortController = new AbortController();
		await search(query, abortController.signal);
	}

	async function search(query: string, signal?: AbortSignal) {
		if (!query.trim()) {
			results = [];
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
				results = data.results || [];
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}

			if (!signal?.aborted) {
				error = err instanceof Error ? err.message : 'Search failed';
				results = [];
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

<DebounceInput
	bind:value={query}
	placeholder="Search movies, TV shows, people..."
	onSearch={handleSearch}
/>

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
						<Poster {media} size={120} />
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
{:else}
	<ul role="list">
		{#each results as result (result.id)}
			{@const title = mediaTitle(result)}
			{@const subtitle = mediaSubtitle(result, navigator.language)}
			<li>
				<button
					onclick={() => {
						selectMedia(result);
					}}
				>
					<Poster media={result} size={120} />
					<div class="metadata">
						<h2 class="title">{title}</h2>
						<p class="subtitle">{subtitle}</p>
					</div>
				</button>
			</li>
		{/each}
	</ul>
{/if}

{#if recentSearches.value.length > 0}
	{@render Section({ title: 'Recent', type: 'history', media: recentSearches.value })}
{/if}
{@render Section({ title: 'Trending Movies', type: 'movie', media: popular.movies })}
{@render Section({ title: 'Trending Shows', type: 'tv', media: popular.tvShows })}
{@render Section({ title: 'Trending People', type: 'person', media: popular.people })}

<style>
	ul {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-block: 2rem;
		padding-inline: 2rem;
		margin-inline: auto;
	}

	li {
		display: flex;

		button {
			flex-grow: 1;
			padding: 0.5em;
			border-radius: calc(0.5em + 18px);
			background: white;
			display: flex;
			align-items: center;
			gap: 1rem;
			transition: scale 0.2s ease-in-out;
			box-shadow:
				0 10px 15px -3px rgb(0 0 0 / 0.1),
				0 4px 6px -4px rgb(0 0 0 / 0.1);
			cursor: pointer;
			border: none;

			&:hover {
				scale: 1.05;
			}

			.metadata {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				text-align: start;
			}
		}
	}

	.popular {
		header {
			h3 {
				display: flex;
				align-items: center;
			}
		}

		ul {
			padding: 1rem;
			display: flex;
			flex-direction: row;
			gap: 1rem;
			overflow-x: scroll;
			scroll-snap-type: x mandatory;
			scroll-padding-inline: 2rem;
		}

		button {
			flex-direction: column;
		}
	}
</style>
