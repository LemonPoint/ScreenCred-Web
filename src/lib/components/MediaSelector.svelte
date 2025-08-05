<script lang="ts">
	import type { MediaDetails } from '$lib/interfaces';
	import { mediaSubtitle, mediaTitle } from '$lib/utils';
	import { comparison, updateComparison } from '$lib/store.svelte';
	import DebounceInput from '$lib/components/DebounceInput.svelte';
	import { goto } from '$app/navigation';
	import Poster from '$lib/components/Poster.svelte';

	type ForWhich = 'first' | 'second';

	const dialogTransitionDuration = 350;

	let searchDialog: HTMLDialogElement;
	let abortController: AbortController | null = null;
	let isClosing = $state(false);

	let forWhich = $state<ForWhich | null>(null);
	let query = $state('');
	let results: MediaDetails[] = $state([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	function startSearch(which: ForWhich) {
		searchDialog.showModal();
		forWhich = which;
		isClosing = false;
	}

	function closeSearch() {
		isClosing = true;

		setTimeout(() => {
			searchDialog.close();
			query = '';
			results = [];
			error = null;
			abortController?.abort();
			abortController = null;
			forWhich = null;
			isClosing = false;
		}, dialogTransitionDuration);
	}

	async function selectMedia(media: MediaDetails) {
		closeSearch();
		if (forWhich) {
			const completedComparison = updateComparison({ [forWhich]: media });
			if (completedComparison) {
				await Promise.all([
					fetch(`/search/${completedComparison.id}`, { method: 'POST' }),
					goto(`/search/${completedComparison.id}`)
				]);
			}
		}
	}

	async function search(query: string, signal?: AbortSignal) {
		if (!query.trim()) {
			results = [];
			return;
		}

		isLoading = true;
		error = null;

		try {
			const url = new URL('/api/search', window.location.origin);
			url.searchParams.set('query', query);
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json'
				},
				signal
			});

			if (!response.ok) {
				error = `Search failed: ${response.status}`;
				return;
			}

			const data = (await response.json()) as { results: MediaDetails[] };

			if (!signal?.aborted) {
				results = data.results || [];
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}

			if (!signal?.aborted) {
				error = err instanceof Error ? err.message : 'Search failed';
				results = [];
			}
		} finally {
			if (!signal?.aborted) {
				isLoading = false;
				abortController = null;
			}
		}
	}

	async function handleSearch(query: string) {
		abortController?.abort();

		if (!query.trim()) {
			results = [];
			error = null;
			isLoading = false;
			return;
		}

		abortController = new AbortController();
		await search(query, abortController.signal);
	}

	$effect(() => {
		return () => {
			abortController?.abort();
		};
	});
</script>

<div class="media-selector">
	<button onclick={() => startSearch('first')}>
		<Poster media={comparison.first} />
	</button>
	<button onclick={() => startSearch('second')}>
		<Poster media={comparison.second} />
	</button>
</div>

<dialog
	bind:this={searchDialog}
	class:closing={isClosing}
	style="--dialog-transition-duration: {dialogTransitionDuration}ms"
>
	<header>
		<DebounceInput
			bind:value={query}
			placeholder="Search movies, TV shows, people..."
			onSearch={handleSearch}
		/>
		<button onclick={closeSearch} aria-label="close"><span class="icon x"></span></button>
	</header>

	{#if isLoading}
		<p>Searching...</p>
	{:else if error}
		<p>Error: {error}</p>
	{:else}
		<ul role="list">
			{#each results as result (result.id)}
				{@const title = mediaTitle(result)}
				{@const subtitle = mediaSubtitle(result, navigator.language)}
				<li>
					<button
						onclick={() => {
							selectMedia(result);
						}}
					>
						<Poster media={result} size={120} />
						<div class="metadata">
							<h2 class="title">{title}</h2>
							<p class="subtitle">{subtitle}</p>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</dialog>

<style>
	.media-selector {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	button {
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
	}

	dialog {
		border: none;
		background: transparent;
		margin-inline: auto;
		width: 100%;
		min-height: 100%;
		opacity: 0;
		scale: 0.95;
		translate: 0 -200px;
		transition:
			opacity var(--dialog-transition-duration) ease-out,
			scale var(--dialog-transition-duration) ease-out,
			translate var(--dialog-transition-duration) ease-out;

		&::backdrop {
			backdrop-filter: blur(10px);
			background-color: rgb(0 0 0 / 0.1);
			opacity: 0;
			transition: opacity var(--dialog-transition-duration) ease-out;
		}

		&[open] {
			opacity: 1;
			scale: 1;
			translate: 0 0;

			@starting-style {
				opacity: 0;
				scale: 0.95;
				translate: 0 -200px;
			}

			&::backdrop {
				opacity: 1;

				@starting-style {
					opacity: 0;
				}
			}
		}

		&.closing {
			opacity: 0;
			scale: 0.95;

			&::backdrop {
				opacity: 0;
			}
		}

		header {
			margin-inline: auto;
			display: flex;
			gap: 1rem;
			font-size: 1.5rem;
			align-items: center;
			position: sticky;
			top: 0;
			z-index: 100;
			max-width: 600px;
		}

		button[aria-label='close'] {
			background: white;
			border: none;
			padding: 0.5rem;
			border-radius: 999px;
			aspect-ratio: 1;
			height: 100%;
			box-shadow:
				0 20px 25px -5px rgb(0 0 0 / 0.1),
				0 8px 10px -6px rgb(0 0 0 / 0.1);
		}

		ul {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			padding-block: 2rem;
			padding-inline: 2rem;
			max-width: 600px;
			margin-inline: auto;
		}

		li {
			display: flex;

			button {
				flex-grow: 1;
				padding: 0.5em;
				border-radius: calc(0.5em + 18px);
				background: white;
				display: flex;
				align-items: center;
				gap: 1rem;
				transition: scale 0.2s ease-in-out;
				box-shadow:
					0 10px 15px -3px rgb(0 0 0 / 0.1),
					0 4px 6px -4px rgb(0 0 0 / 0.1);

				&:hover {
					scale: 1.05;
				}

				.metadata {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					text-align: start;
				}
			}
		}
	}
</style>
