<script>
	import DebounceInput from '$lib/components/DebounceInput.svelte';
	import { handleSearch, query } from '$lib/search.svelte';
</script>

<div class="search-wrapper">
	<div class="search">
		<DebounceInput
			bind:value={query.current}
			placeholder="Search movies, TV shows, people..."
			onSearch={handleSearch}
		/>
		<span class="icon magnifying-glass"></span>
	</div>
</div>

<style>
	.search-wrapper {
		display: flex;
		align-items: end;
		padding-top: 2rem;
		padding-inline: var(--body-padding-inline);
		width: 100%;
	}
	.search {
		width: 100%;
		max-width: 900px;
		margin-inline: auto;
		font-size: clamp(1rem, 2vw, 1.5rem);
		position: relative;
		pointer-events: all;

		.icon {
			position: absolute;
			right: 1rem;
			top: 50%;
			transform: translateY(-50%);
			color: var(--uchu-gray-8);
		}
	}
</style>
