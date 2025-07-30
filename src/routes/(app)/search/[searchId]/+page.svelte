<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';
	import { updateComparison } from '$lib/store.svelte.js';

	let { data } = $props();

	updateComparison({ first: data.first, second: data.second });
</script>

{#if data.results.type === 'union'}
	<CombinedResults results={data.results} />
{:else}
	<SimpleResults />
{/if}
