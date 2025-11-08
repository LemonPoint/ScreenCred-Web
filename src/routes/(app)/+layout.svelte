<script>
	import MediaSelector from '$lib/components/MediaSelector.svelte';
	import Header from '$lib/components/Header.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { query } from '$lib/search.svelte.ts';

	let { children } = $props();
</script>

<div class="header-wrapper">
	<Header />
	<div class="header-content">
		<MediaSelector small={page.url.pathname === resolve('/(app)/search')} />
		{#if page.url.pathname === resolve('/(app)/search')}
			<SearchInput />
		{/if}
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
