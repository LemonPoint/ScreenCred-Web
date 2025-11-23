<script>
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

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
