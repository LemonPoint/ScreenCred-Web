<script>
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:title" content="ScreenCred" />
	<meta
		property="og:description"
		content="Find the connections between movies, shows, and the people who make them."
	/>
	<meta property="og:image" content="/img/screencred_social.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="/img/screencred_social.png" />
	<meta name="twitter:title" content="ScreenCred" />
	<meta
		name="twitter:description"
		content="Find the connections between movies, shows, and the people who make them."
	/>
</svelte:head>

<Header />

<article class="standalone">
	{@render children()}
</article>

<style>
	article {
		padding-inline: var(--body-padding-inline);
		max-width: 600px;
		margin-inline: auto;
	}
</style>
