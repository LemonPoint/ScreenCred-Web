<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		MediaDetails,
		MovieDetails,
		PagedResponse,
		PersonDetails,
		TVDetails
	} from '$lib/interfaces.js';
	import { recentSearches, updateComparison, updateRecentSearches } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { mediaSubtitle, mediaTitle } from '$lib/utils';
	import Poster from '$lib/components/Poster.svelte';
	import { page } from '$app/state';
	import z from 'zod';
	import { resolve } from '$app/paths';
	import { error, isLoading, query, resetSearch, searchResults } from '$lib/search.svelte';

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
			resetSearch();
			const path = resolve('/(app)/search');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(`${path}?for=second`, {});
		}
	}

	// $effect(() => {
	// 	return () => {
	// 		abortController?.abort();
	// 	};
	// });
</script>

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

<style>
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
