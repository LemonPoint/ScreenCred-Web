<script lang="ts">
	import type { MediaDetails } from '$lib/interfaces';
	import { mediaImage, mediaSubtitle, mediaTitle } from '$lib/utils';
	import { comparison, updateComparison } from '$lib/store.svelte';
	import DebounceInput from '$lib/components/DebounceInput.svelte';
	import { goto } from '$app/navigation';

	type ForWhich = 'first' | 'second';

	let searchDialog: HTMLDialogElement;
	let abortController: AbortController | null = null;

	let forWhich = $state<ForWhich | null>(null);
	let query = $state('');
	let results: MediaDetails[] = $state([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	function startSearch(which: ForWhich) {
		searchDialog.showModal();
		forWhich = which;
	}

	function closeSearch() {
		searchDialog.close();
		query = '';
		results = [];
		error = null;
		abortController?.abort();
		abortController = null;
		forWhich = null;
	}

	async function selectMedia(media: MediaDetails) {
		if (forWhich) {
			console.log('selectMedia', forWhich);
			const newSearchId = updateComparison({ [forWhich]: media });
			console.log('newSearchId', newSearchId);
			if (newSearchId) {
				console.log('doings tuff');
				await Promise.all([
					fetch(`/search/${newSearchId}`, { method: 'POST' }),
					goto(`/search/${newSearchId}`)
				]);
			}
		}
		closeSearch();
	}

	async function search(query: string, signal?: AbortSignal) {
		if (!query.trim()) {
			results = [];
			return;
		}

		isLoading = true;
		error = null;

		try {
			const url = new URL('/search', window.location.origin);
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

<button onclick={() => startSearch('first')}>
	{#if comparison.first}
		<img src={mediaImage(comparison.first, 185)} alt={mediaTitle(comparison.first)} />
	{/if}
	<span>{comparison.first ? mediaTitle(comparison.first) : 'First'}</span>
</button>
<button onclick={() => startSearch('second')}>
	{#if comparison.second}
		<img src={mediaImage(comparison.second, 185)} alt={mediaTitle(comparison.second)} />
	{/if}
	<span>{comparison.second ? mediaTitle(comparison.second) : 'Second'}</span>
</button>
<dialog bind:this={searchDialog}>
	<button onclick={closeSearch}>Close</button>
	<DebounceInput
		bind:value={query}
		placeholder="Search movies, TV shows, people..."
		onSearch={handleSearch}
	/>

	{#if isLoading}
		<p>Searching...</p>
	{:else if error}
		<p>Error: {error}</p>
	{:else}
		<ul role="list">
			{#each results as result (result.id)}
				{@const imagePath = mediaImage(result, 185)}
				{@const title = mediaTitle(result)}
				{@const subtitle = mediaSubtitle(result, navigator.language)}
				<li>
					<button
						onclick={() => {
							selectMedia(result);
						}}
					>
						<img src={imagePath} alt={title} />
						<div class="metadata">
							<p class="title">{title}</p>
							<p class="subtitle">{subtitle}</p>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</dialog>
