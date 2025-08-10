<script lang="ts">
	import { type ComparisonState, recentComparisons, resetComparison } from '$lib/store.svelte';
	import ComparisonCard from '$lib/components/ComparisonCard.svelte';

	resetComparison();

	const suggestions: ComparisonState[] = [
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
		color: white;
		font-weight: 500;
		margin-top: 1rem;
	}
	ul {
		padding: 0;
		padding-block: 1rem;
		display: flex;
		gap: 1rem;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 1rem;

		&::-webkit-scrollbar {
			display: none;
		}
	}
</style>
