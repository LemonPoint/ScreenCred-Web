<script lang="ts">
	import { comparison } from '$lib/store.svelte';
	import Poster from '$lib/components/Poster.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';

	function startSearch(forWhich: 'first' | 'second') {
		console.log('start search', forWhich);
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

<dialog>
	<SearchInput />
</dialog>

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
