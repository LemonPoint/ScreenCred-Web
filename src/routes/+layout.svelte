<script>
	import MediaSelector from '$lib/components/MediaSelector.svelte';

	let { children } = $props();
</script>

<h1>ScreenCred</h1>

<MediaSelector />

{@render children()}
