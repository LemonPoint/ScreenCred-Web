import type { MediaDetails } from '$lib/interfaces';

interface ComparisonState {
	first?: MediaDetails;
	second?: MediaDetails;
}

export let comparison: ComparisonState = $state({});

export function updateComparison({ first, second }: ComparisonState) {
	if (first) {
		comparison.first = first;
	}
	if (second) {
		comparison.second = second;
	}
}
