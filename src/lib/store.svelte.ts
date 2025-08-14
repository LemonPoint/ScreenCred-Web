import type { MediaDetails } from '$lib/interfaces';
import { localStore } from '$lib/storage.svelte';
import { normalizeMediaDetails, normalizeSearchId } from '$lib/utils';

export interface ComparisonState {
	id?: string;
	normalizedId?: string;
	first?: MediaDetails;
	second?: MediaDetails;
}

export const comparison: ComparisonState = $state({});
export const recentComparisons = localStore('recentComparisons', [] as Required<ComparisonState>[]);
export const recentSearches = localStore('recentSearches', [] as MediaDetails[]);

export function resetComparison() {
	comparison.id = undefined;
	comparison.normalizedId = undefined;
	comparison.first = undefined;
	comparison.second = undefined;
}

export function updateComparison({ first, second }: ComparisonState): ComparisonState | undefined {
	const previous = { ...comparison };

	if (first) {
		comparison.first = first;
	}
	if (second) {
		comparison.second = second;
	}

	const hasChanged =
		!equals(previous.first, comparison.first) || !equals(previous.second, comparison.second);

	if (hasChanged && comparison.first && comparison.second) {
		comparison.id = `${makeId(comparison.first)}${makeId(comparison.second)}`;
		comparison.normalizedId = normalizeSearchId(
			makeId(comparison.first),
			makeId(comparison.second)
		);
		updateRecentComparisons(comparison);
		return comparison;
	}
}

function updateRecentComparisons({ id, normalizedId, first, second }: ComparisonState) {
	if (id && normalizedId && first && second) {
		const recentComparison = {
			id,
			normalizedId,
			first: normalizeMediaDetails(first),
			second: normalizeMediaDetails(second)
		};
		const _recentComparisons = [...recentComparisons.value];
		const existingIndex = _recentComparisons.findIndex((c) => c.normalizedId === normalizedId);
		if (existingIndex > -1) {
			_recentComparisons.splice(existingIndex, 1);
		}
		recentComparisons.value = [recentComparison, ..._recentComparisons].slice(0, 10);
	}
}

export function updateRecentSearches(searches: MediaDetails[]) {
	const normalizedMedia = searches.map(normalizeMediaDetails);
	const _recentSearches = [...recentSearches.value];
	for (const media of normalizedMedia) {
		const existingIndex = _recentSearches.findIndex((m) => m.id === media.id);
		if (existingIndex > -1) {
			_recentSearches.splice(existingIndex, 1);
		}
	}
	recentSearches.value = [...normalizedMedia, ..._recentSearches].slice(0, 10);
}

function equals(a?: MediaDetails, b?: MediaDetails) {
	if (!a || !b) {
		return false;
	}
	return a.id === b.id && a.mediaType === b.mediaType;
}

function makeId({ id, mediaType }: MediaDetails) {
	switch (mediaType) {
		case 'movie':
			return `m${id}`;
		case 'tv':
			return `t${id}`;
		case 'person':
			return `p${id}`;
	}
}
