<script lang="ts">
	import type { CombinedCredit, UnionComparison } from '$lib/server/comparison';
	import { mediaTitleWithYear, tmdbImageUrl, tmdbImageUrlSquare } from '$lib/utils';
	import type { MediaDetails } from '$lib/interfaces';
	import Credits from '$lib/components/Credits.svelte';

	interface Props {
		first: MediaDetails;
		second: MediaDetails;
		results: UnionComparison;
	}

	const { first, second, results }: Props = $props();
</script>

{#snippet CreditImage(credit: CombinedCredit)}
	{@const imageUrl =
		credit.type === 'person'
			? tmdbImageUrlSquare(credit.profilePath)
			: tmdbImageUrl(credit.profilePath)}
	<div class={['image', credit.type]}>
		{#if imageUrl}
			<img src={imageUrl} alt={credit.name} />
		{:else}
			<span class={['icon', credit.type]}></span>
		{/if}
	</div>
{/snippet}

{#if results.credits.length === 0}
	<p>
		Looks like no one worked on both <strong>{mediaTitleWithYear(first)}</strong> and
		<strong>{mediaTitleWithYear(second)}</strong>.
	</p>
{:else}
	<ul role="list" class="results">
		{#each results.credits as credit (credit.id)}
			<li>
				<header>
					{@render CreditImage(credit)}
					<h2>{credit.name}</h2>
				</header>
				<Credits castRoles={credit.roles.firstCast} crewRoles={credit.roles.firstCrew} />
				<Credits castRoles={credit.roles.secondCast} crewRoles={credit.roles.secondCrew} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	.results {
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 2rem;
		padding: 0;
		margin-block: 1rem;

		> li {
			grid-column: span 2;
			display: grid;
			grid-template-columns: subgrid;
			gap: 1rem;
			position: relative;

			header {
				grid-column: span 2;
				display: flex;
				gap: 1rem;
				align-items: center;

				.image {
					width: 100px;
					aspect-ratio: 2/3;
					border-radius: 10px;
					overflow: hidden;
					display: flex;
					justify-content: center;
					align-items: center;
					background: var(--uchu-yin-9);
					box-shadow: var(--shadow-3);
					font-size: 2rem;

					img {
						height: 100%;
					}

					&.person {
						aspect-ratio: 1;
					}
				}
			}
		}
	}
</style>
