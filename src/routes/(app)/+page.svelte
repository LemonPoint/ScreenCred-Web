<script lang="ts">
	import { recentComparisons, resetComparison } from '$lib/store.svelte';
	import ComparisonCard from '$lib/components/ComparisonCard.svelte';

	resetComparison();
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

<style>
	ul {
		padding: 1rem;
		display: flex;
		gap: 1rem;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 2rem;
	}
</style>
