<script lang="ts">
	import Poster from '$lib/components/Poster.svelte';
	import { query } from '$lib/search.svelte';
	import { comparison } from '$lib/store.svelte';
	import Search from './Search.svelte';

	let dialogRef: HTMLDialogElement | null = null;

	function startSearch(forWhich: 'first' | 'second') {
		query.forWhich = forWhich;
		dialogRef?.showModal();
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

<dialog bind:this={dialogRef}>
	<Search />
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

	dialog {
		padding: 0;
		margin: var(--body-padding-inline);
		border: none;
		background: none;
		backdrop-filter: blur(30px) brightness(0.4);
		width: calc(100vw - var(--body-padding-inline));
		max-height: 900px;
		max-width: 900px;
		margin: auto;
		border-radius: 10px;
		overflow: auto;
		box-shadow: var(--shadow-5);
	}
</style>
