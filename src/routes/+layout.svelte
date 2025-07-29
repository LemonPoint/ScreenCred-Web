<script>
	import MediaSelector from '$lib/components/MediaSelector.svelte';

	let { children } = $props();
</script>

<MediaSelector />

{@render children()}
