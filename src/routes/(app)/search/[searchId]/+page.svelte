<script lang="ts">
	import CombinedResults from './CombinedResults.svelte';
	import SimpleResults from './SimpleResults.svelte';
	import { updateComparison } from '$lib/store.svelte.js';
	import { mediaImageId, mediaTitle } from '$lib/utils';
	import { page } from '$app/state';
	import { untrack } from 'svelte';

	let { data } = $props();
	let first = $derived(data.first);
	let second = $derived(data.second);
	let results = $derived(data.results);
	let ogImageUrl = $derived(`/search/${mediaImageId(first)}__${mediaImageId(second)}.png`);
	let title = $derived.by(() => {
		return `${mediaTitle(first)} & ${mediaTitle(second)}`;
	});

	const hasShare = !!navigator.share;

	async function share() {
		const shareData = {
			title,
			url: page.url.href
		};

		try {
			await navigator.share(shareData);
		} catch (error) {
			console.error('Error sharing:', error);
		}
	}

	$effect(() => {
		untrack(() => updateComparison({ first, second }));
		fetch(ogImageUrl);
	});
</script>

<svelte:head>
	<meta property="og:title" content={title} />
	<meta property="og:description" content="" />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content="" />
</svelte:head>

<div class="results-wrapper">
	{#if results.type === 'union'}
		<CombinedResults {...data} {results} />
	{:else}
		<SimpleResults {...data} {results} />
	{/if}
</div>

{#if hasShare}
	<button class="share" onclick={share} aria-label="Share">
		<span class="icon share"></span>
		<span>Share</span>
	</button>
{/if}

<style>
	.results-wrapper {
		padding: var(--body-padding-inline);
		max-width: 600px;
		container-type: inline-size;
		margin-inline: auto;
	}

	button.share {
		position: fixed;
		bottom: var(--body-padding-inline);
		right: var(--body-padding-inline);
		border: none;
		background: var(--uchu-blue-4);
		color: var(--uchu-yang);
		padding: 0.5em;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25em;
		border-radius: 0.5em;
		box-shadow: var(--shadow-3);

		.icon {
			font-size: 1.5em;
		}

		&:hover {
			background-color: var(--uchu-blue-5);
		}
	}
</style>
