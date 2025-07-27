<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';

	let { data } = $props();
</script>

{#if data.results.type === "union"}
	<CombinedResults results={data.results} />
{:else}
	<SimpleResults />
{/if}