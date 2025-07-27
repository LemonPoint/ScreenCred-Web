import { MEDIA_TYPE_KEY, type MediaTypeKey } from '$lib/interfaces';
import { getDetails } from '$lib/tmdb';
import { compare } from '$lib/comparison';

type ParsedComparison = {
	type: MediaTypeKey;
	id: string;
};

export const load = async ({ params }) => {
	const matches = [...params.searchId.matchAll(/(?<type>[mtp])(?<id>\d+)/g)];
	const comparisons: {
		first: ParsedComparison | null;
		second: ParsedComparison | null;
	} = {
		first: matches[0]
			? {
					...(matches[0].groups as ParsedComparison)
				}
			: null,
		second: matches[1]
			? {
					...(matches[1].groups as ParsedComparison)
				}
			: null
	};
	if (comparisons.first !== null && comparisons.second !== null) {
		const [first, second] = await Promise.all([
			getDetails(MEDIA_TYPE_KEY[comparisons.first.type], parseInt(comparisons.first.id)),
			getDetails(MEDIA_TYPE_KEY[comparisons.second.type], parseInt(comparisons.second.id))
		]);
		return await compare(first, second);
	}
};
