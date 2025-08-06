<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';
	import { updateComparison } from '$lib/store.svelte.js';

	let { data } = $props();
	const { first, second, results } = data;

	updateComparison({ first, second });
</script>

{#if results.type === 'union'}
	<CombinedResults {...data} {results} />
{:else}
	<SimpleResults />
{/if}
