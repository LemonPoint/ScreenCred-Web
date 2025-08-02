<script lang="ts">
	import { recentComparisons, resetComparison } from '$lib/store.svelte';

	resetComparison();
</script>

<ul>
	{#each recentComparisons.value as comparison (comparison.normalizedId)}
		<li>{comparison.id}</li>
	{/each}
</ul>
