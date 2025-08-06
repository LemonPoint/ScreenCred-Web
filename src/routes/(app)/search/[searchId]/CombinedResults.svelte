<script lang="ts">
	import type { UnionComparison } from '$lib/server/comparison';
	import { mediaTitleWithYear, tmdbImageUrl, tmdbImageUrlSquare } from '$lib/utils';
	import type { MediaDetails } from '$lib/interfaces';

	type Roles = string[];

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

{#snippet Credits(castRoles: Roles, crewRoles: Roles)}
	<div>
		{#if castRoles.length}
			<h3>Cast</h3>
			<ul>
				{#each castRoles as cast, index (index)}
					<li>{cast}</li>
				{/each}
			</ul>
		{/if}
		{#if crewRoles.length}
			<h3>Crew</h3>
			<ul>
				{#each crewRoles as crew, index (index)}
					<li>{crew}</li>
				{/each}
			</ul>
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
				{@render Credits(credit.roles.firstCast, credit.roles.firstCrew)}
				{@render Credits(credit.roles.secondCast, credit.roles.secondCrew)}
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
		margin: 1rem;

		> li {
			grid-column: span 2;
			display: grid;
			grid-template-columns: subgrid;
			gap: 1rem;

			header {
				grid-column: span 2;
				display: flex;
				gap: 1rem;
				align-items: center;

				.image {
					width: 100px;
					aspect-ratio: 2/3;
					border-radius: 1em;
					overflow: hidden;
					display: flex;
					justify-content: center;
					align-items: center;
					background: oklch(96.7% 0.003 264.542);
					box-shadow:
						0 20px 25px -5px rgb(0 0 0 / 0.1),
						0 8px 10px -6px rgb(0 0 0 / 0.1);
					font-size: 2rem;

					&.person {
						aspect-ratio: 1;
					}
				}
			}

			h3 {
				color: oklch(55% 0.003 264.542);
				text-transform: uppercase;
				font-weight: 500;
				font-size: 1em;
				margin-top: 1em;
			}

			ul {
				list-style-position: inside;
				padding: 0;
			}
		}
	}
</style>
