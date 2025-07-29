import type { MediaDetails } from '$lib/interfaces';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

interface ComparisonState {
	first?: MediaDetails;
	second?: MediaDetails;
}

export const comparison: ComparisonState = $state({});

export function updateComparison({ first, second }: ComparisonState) {
	if (first) {
		comparison.first = first;
	}
	if (second) {
		comparison.second = second;
	}

	if (browser && comparison.first && comparison.second) {
		goto(`/search/${makeId(comparison.first)}${makeId(comparison.second)}`);
	}
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
