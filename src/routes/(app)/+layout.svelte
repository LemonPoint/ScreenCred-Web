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
		margin: var(--body-padding-inline);
	}
</style>
