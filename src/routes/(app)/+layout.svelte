<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import MediaSelector from '$lib/components/MediaSelector.svelte';
	import Search from '$lib/components/Search.svelte';

	let { children } = $props();

	let searchRef: Search | null = $state(null);
</script>

<div class="header-wrapper">
	<Header />
	<div class="header-content">
		<MediaSelector {searchRef} />
	</div>
</div>
<Search bind:this={searchRef} />

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
