<script lang="ts">
	import Poster from '$lib/components/Poster.svelte';
	import { query } from '$lib/search.svelte';
	import { comparison } from '$lib/store.svelte';
	import Search from './Search.svelte';

	let searchRef: Search | null = null;

	function startSearch(forWhich: 'first' | 'second') {
		query.forWhich = forWhich;
		searchRef?.start();
	}
</script>

<div class="media-selector">
	<button onclick={() => startSearch('first')}>
		<Poster media={comparison.first} />
	</button>
	<button onclick={() => startSearch('second')}>
		<Poster media={comparison.second} />
	</button>
</div>

<Search bind:this={searchRef} />

<style>
	@keyframes scaleDown {
		to {
			max-width: 200px;
		}
	}

	.media-selector {
		display: grid;
		grid-template-columns: 1fr 1fr;
		max-width: 400px;
		margin-inline: auto;
		gap: 1rem;

		animation: scaleDown linear forwards;
		animation-timeline: scroll();
		animation-range: 100px 350px;
		transition: max-width 0.2s ease-out;
	}

	button {
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
	}
</style>
