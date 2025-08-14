<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';
	import { updateComparison } from '$lib/store.svelte.js';

	let { data } = $props();
	const { first, second, results } = data;

	updateComparison({ first, second });
</script>

<div class="results-wrapper">
	{#if results.type === 'union'}
		<CombinedResults {...data} {results} />
	{:else}
		<SimpleResults {...data} {results} />
	{/if}
</div>

<style>
	.results-wrapper {
		padding: var(--body-padding-inline);
	}
</style>
