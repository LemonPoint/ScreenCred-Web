<script lang="ts">
	import { type ComparisonState, recentComparisons, resetComparison } from '$lib/store.svelte';
	import ComparisonCard from '$lib/components/ComparisonCard.svelte';
	import { page } from '$app/state';

	resetComparison();

	const suggestions: ComparisonState[] = [
		{
			id: 'm324857m803796',
			normalizedId: 'm324857m803796',
			first: {
				id: 324857,
				posterPath: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
				releaseDate: '2018-12-14',
				title: 'Spider-Man: Into the Spider-Verse',
				mediaType: 'movie'
			},
			second: {
				id: 803796,
				posterPath: '/zT7Lhw3BhJbMkRqm9Zlx2YGMsY0.jpg',
				releaseDate: '2025-06-20',
				title: 'KPop Demon Hunters',
				mediaType: 'movie'
			}
		},
		{
			first: {
				id: 13242,
				name: 'Paul Giamatti',
				mediaType: 'person',
				profilePath: '/kn7LAbFYP5RPC2r61tDx2CRUeuw.jpg'
			},
			second: {
				id: 11870,
				title: 'Big Fat Liar',
				posterPath: '/3EjpQeyOpH8VIaWqIq6SpCQrCks.jpg',
				releaseDate: '2002-02-08',
				mediaType: 'movie'
			},
			id: 'p13242m11870',
			normalizedId: 'm11870p13242'
		},
		{
			id: 't97546t136311',
			normalizedId: 't136311t97546',
			first: {
				firstAirDate: '2020-08-14',
				id: 97546,
				name: 'Ted Lasso',
				posterPath: '/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg',
				mediaType: 'tv'
			},
			second: {
				firstAirDate: '2023-01-26',
				id: 136311,
				name: 'Shrinking',
				posterPath: '/cVmrNYgm5wcEexbXg4laNn3u4vq.jpg',
				mediaType: 'tv'
			}
		},
		{
			id: 't95396m116745',
			normalizedId: 'm116745t95396',
			first: {
				firstAirDate: '2022-02-17',
				id: 95396,
				name: 'Severance',
				posterPath: '/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
				mediaType: 'tv'
			},
			second: {
				id: 116745,
				posterPath: '/tY6ypjKOOtujhxiSwTmvA4OZ5IE.jpg',
				releaseDate: '2013-12-18',
				title: 'The Secret Life of Walter Mitty',
				mediaType: 'movie'
			}
		},
		{
			id: 'm165m120',
			normalizedId: 'm120m165',
			first: {
				id: 165,
				posterPath: '/hQq8xZe5uLjFzSBt4LanNP7SQjl.jpg',
				releaseDate: '1989-11-22',
				title: 'Back to the Future Part II',
				mediaType: 'movie'
			},
			second: {
				id: 120,
				posterPath: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
				releaseDate: '2001-12-18',
				title: 'The Lord of the Rings: The Fellowship of the Ring',
				mediaType: 'movie'
			}
		},
		{
			id: 'm9353m8193',
			normalizedId: 'm8193m9353',
			first: {
				id: 9353,
				title: 'Nacho Libre',
				posterPath: '/kh7B91bMl2lZ0mH9WhPfaNUIEQH.jpg',
				mediaType: 'movie',
				releaseDate: '2006-06-16'
			},
			second: {
				id: 8193,
				title: 'Napoleon Dynamite',
				posterPath: '/6Iv6Uwa2SBLN0dSGM00rdrwN4MJ.jpg',
				mediaType: 'movie',
				releaseDate: '2004-06-11'
			}
		},
		{
			id: 'm330459t83867',
			normalizedId: 'm330459t83867',
			first: {
				id: 330459,
				title: 'Rogue One: A Star Wars Story',
				posterPath: '/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg',
				mediaType: 'movie',
				releaseDate: '2016-12-14'
			},
			second: {
				id: 83867,
				name: 'Andor',
				posterPath: '/khZqmwHQicTYoS7Flreb9EddFZC.jpg',
				mediaType: 'tv',
				firstAirDate: '2022-09-21'
			}
		}
	];
</script>

<svelte:head>
	<title>ScreenCred</title>
	<meta property="og:title" content="ScreenCred" />
	<meta
		property="og:description"
		content="Find the connections between movies, shows, and the people who make them."
	/>
	<meta property="og:image" content="/img/screencred_social.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="/img/screencred_social.png" />
	<meta name="twitter:title" content="ScreenCred" />
	<meta
		name="twitter:description"
		content="Find the connections between movies, shows, and the people who make them."
	/>
</svelte:head>

{#if recentComparisons.value.length > 0}
	<section>
		<h2>Recents</h2>
		<ul role="list">
			{#each recentComparisons.value as comparison (comparison.normalizedId)}
				<li>
					<ComparisonCard {comparison} />
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<section class="no-recents">
		<p>Find the connections between movies, shows, and the people who make them.</p>
		<p>Search above to get started or try one of the suggestions below!</p>
	</section>
{/if}

<section>
	<h2>Suggestions</h2>
	<ul role="list">
		{#each suggestions as comparison (comparison.normalizedId)}
			<li>
				<ComparisonCard {comparison} />
			</li>
		{/each}
	</ul>
</section>

<style>
	h2 {
		font-weight: 500;
		margin-top: 1rem;
		margin-inline-start: var(--body-padding-inline);
	}
	ul {
		padding: 2em var(--body-padding-inline);
		padding-block: 1rem;
		display: flex;
		gap: 1rem;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--body-padding-inline);

		&::-webkit-scrollbar {
			display: none;
		}
	}
	.no-recents {
		margin-bottom: 2em;
		/*margin-inline: var(--body-padding-inline);*/
		padding: var(--body-padding-inline);
		padding-block: 1rem;
		font-size: 1.25rem;
		background: var(--uchu-yin-9);
		/*border-radius: 0.5em;*/
		grid-column: span 2;
		display: grid;
		grid-template-columns: subgrid;
		gap: 1rem;
		position: relative;
		box-shadow: var(--shadow-2);

		p:first-child {
			font-weight: 600;
		}
	}
</style>
