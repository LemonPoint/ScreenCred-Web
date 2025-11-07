<script>
	import MediaSelector from '$lib/components/MediaSelector.svelte';

	let { children } = $props();
</script>

<div class="media-selector">
	<MediaSelector />
</div>

{@render children()}

<style>
	.media-selector {
		position: sticky;
		top: 0;
		z-index: 1;
		backdrop-filter: blur(10px);
		box-shadow: var(--shadow-2);
		padding-inline: var(--body-padding-inline);
		padding-block: 1rem;
	}
</style>
