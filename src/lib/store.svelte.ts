import type { MediaDetails } from '$lib/interfaces';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

interface ComparisonState {
	first?: MediaDetails;
	second?: MediaDetails;
}

export const comparison: ComparisonState = $state({});

export function updateComparison({ first, second }: ComparisonState) {
	const previous = { ...comparison };

	if (first) {
		comparison.first = first;
	}
	if (second) {
		comparison.second = second;
	}

	const shouldNavigate =
		!equals(previous.first, comparison.first) || !equals(previous.second, comparison.second);

	if (browser && shouldNavigate && comparison.first && comparison.second) {
		goto(`/search/${makeId(comparison.first)}${makeId(comparison.second)}`);
	}
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
