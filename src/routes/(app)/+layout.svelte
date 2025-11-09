<script>
	import Header from '$lib/components/Header.svelte';
	import MediaSelector from '$lib/components/MediaSelector.svelte';

	let { children } = $props();
</script>

<div class="header-wrapper">
	<Header />
	<div class="header-content">
		<MediaSelector />
	</div>
</div>

{@render children()}

<style>
	.header-wrapper {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.header-content {
		backdrop-filter: blur(10px);
		padding-inline: var(--body-padding-inline);
		padding-block: 1rem;
	}
</style>
