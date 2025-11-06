<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';
	import { updateComparison } from '$lib/store.svelte.js';
	import { mediaImageId, mediaTitle } from '$lib/utils';
	import { page } from '$app/state';

	let { data } = $props();
	const { first, second, results } = data;
	const ogImageUrl = `/search/${mediaImageId(first)}__${mediaImageId(second)}.png`;

	updateComparison({ first, second });
</script>

<svelte:head>
	<meta property="og:title" content={`${mediaTitle(first)} & ${mediaTitle(second)}`} />
	<meta property="og:description" content="" />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:title" content={`${mediaTitle(first)} & ${mediaTitle(second)}`} />
	<meta name="twitter:description" content="" />
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
