import type { MediaDetails } from '$lib/interfaces';
import { mediaImage, mediaTitle } from '$lib/utils';
import { SAM } from '$lib/sam';

export const query: { current: string; forWhich: 'first' | 'second' } = $state({
	current: '',
	forWhich: 'first'
});
let abortController: AbortController | null = null;
let _searchResults: MediaDetails[] | null = $state(null);
let _isLoading = $state(false);
let _error = $state<string | null>(null);

export function searchResults() {
	return _searchResults;
}

export function isLoading() {
	return _isLoading;
}

export function error() {
	return _error;
}

export async function handleSearch(query: string) {
	abortController?.abort();

	if (!query.trim()) {
		_searchResults = [];
		_error = null;
		_isLoading = false;
		return;
	}

	abortController = new AbortController();
	await search(query, abortController.signal);
}

async function search(query: string, signal?: AbortSignal) {
	if (!query.trim()) {
		_searchResults = [];
		return;
	}

	if (query.toLowerCase() === 'sam warnick') {
		_searchResults = [SAM];
		return;
	}

	_isLoading = true;
	_error = null;

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
			_error = `Search failed: ${response.status}`;
			return;
		}

		const data = (await response.json()) as { results: MediaDetails[] };

		if (!signal?.aborted) {
			const lowercasedQuery = query.toLowerCase();
			const results = data.results || [];
			const sortedResults = results.sort((a, b) => {
				const lhsName = mediaTitle(a).toLowerCase();
				const rhsName = mediaTitle(b).toLowerCase();

				if (a.mediaType === 'person' && mediaImage(a) === null) {
					return 1; // a comes after b
				} else if (b.mediaType === 'person' && mediaImage(b) === null) {
					return -1; // a comes before b
				} else if (lhsName === rhsName) {
					return (b.popularity ?? 0) - (a.popularity ?? 0); // higher popularity first
				} else if (lhsName === lowercasedQuery) {
					return -1; // a comes before b (exact match priority)
				} else if (rhsName === lowercasedQuery) {
					return 1; // a comes after b (exact match priority)
				} else if (!lhsName.includes(lowercasedQuery)) {
					return 1; // a comes after b (doesn't contain query)
				} else if (!rhsName.includes(lowercasedQuery)) {
					return -1; // a comes before b (contains query)
				} else {
					return (b.popularity ?? 0) - (a.popularity ?? 0); // higher popularity first
				}
			});
			_searchResults = sortedResults;
		}
	} catch (err) {
		if (err instanceof Error && err.name === 'AbortError') {
			return;
		}

		if (!signal?.aborted) {
			_error = err instanceof Error ? err.message : 'Search failed';
			_searchResults = [];
		}
	} finally {
		if (!signal?.aborted) {
			_isLoading = false;
			abortController = null;
		}
	}
}

export function resetSearch() {
	_searchResults = null;
	_error = null;
	_isLoading = false;
	query.current = '';
	abortController?.abort();
	abortController = null;
}
