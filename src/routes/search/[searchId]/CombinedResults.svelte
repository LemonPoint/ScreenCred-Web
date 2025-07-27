<script lang="ts">
	import type { UnionComparison } from '$lib/server/comparison';
	import Credits from './Credits.svelte';

	interface Props {
		results: UnionComparison;
	}

	const { results }: Props = $props();
</script>

<ul>
	{#each results.credits as credit (credit.id)}
		<li>
			<h2>{credit.name}</h2>
			<Credits castRoles={credit.roles.firstCast} crewRoles={credit.roles.firstCrew} />
			<Credits castRoles={credit.roles.secondCast} crewRoles={credit.roles.secondCrew} />
		</li>
	{/each}
</ul>
