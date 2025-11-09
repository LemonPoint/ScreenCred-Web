<script lang="ts">
	import DebounceInput from '$lib/components/DebounceInput.svelte';
	import { handleSearch, query, resetSearch } from '$lib/search.svelte';
</script>

<div class="search-wrapper">
	<div class="search">
		<DebounceInput
			bind:value={query.current}
			placeholder="Search movies, TV shows, people..."
			onSearch={handleSearch}
		/>
		<span class="icon magnifying-glass"></span>
		{#if query.current.trim()}
			<button aria-label="Clear Search" onclick={resetSearch}>
				<span class="icon x"></span>
			</button>
		{/if}
	</div>
</div>

<style>
	.search-wrapper {
		display: flex;
		align-items: end;
		width: 100%;
	}

	.search {
		width: 100%;
		max-width: 900px;
		margin-inline: auto;
		font-size: clamp(1rem, 2vw, 1.5rem);
		position: relative;
		pointer-events: all;

		.icon.magnifying-glass {
			position: absolute;
			left: 1rem;
			top: 50%;
			transform: translateY(-50%);
			color: var(--uchu-gray-8);
		}

		button {
			position: absolute;
			right: 1rem;
			top: 50%;
			transform: translateY(-50%);
			background: var(--uchu-gray-2);
			color: var(--uchu-gray-9);
			display: flex;
			justify-content: center;
			align-items: center;
			aspect-ratio: 1;
			border-radius: 999px;
			font-size: 0.75em;
			border: none;
			box-shadow: var(--shadow-1);
		}
	}
</style>
