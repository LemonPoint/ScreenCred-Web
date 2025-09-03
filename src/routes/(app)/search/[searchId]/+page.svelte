<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';
	import { updateComparison } from '$lib/store.svelte.js';
	import { mediaImageId } from '$lib/utils';

	let { data } = $props();
	const { first, second, results } = data;
	const ogImageUrl = `/search/${mediaImageId(first)}__${mediaImageId(second)}.png`;

	updateComparison({ first, second });
</script>

<svelte:head>
	<meta name="og:image" content={ogImageUrl} />
</svelte:head>

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
