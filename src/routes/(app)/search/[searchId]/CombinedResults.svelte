<script lang="ts">
	import type { UnionComparison } from '$lib/server/comparison';

	type Roles = string[];

	interface Props {
		results: UnionComparison;
	}

	const { results }: Props = $props();
</script>

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

<ul role="list" class="results">
	{#each results.credits as credit (credit.id)}
		<li>
			<h2>{credit.name}</h2>
			{@render Credits(credit.roles.firstCast, credit.roles.firstCrew)}
			{@render Credits(credit.roles.secondCast, credit.roles.secondCrew)}
		</li>
	{/each}
</ul>

<style>
	.results {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 0;
		margin: 1rem;

		> li {
			border: 1px solid #ccc;
			grid-column: span 2;
			display: grid;
			grid-template-columns: subgrid;
			padding: 1rem;
			border-radius: 1rem;

			h2 {
				grid-column: span 2;
			}
		}
	}
</style>
