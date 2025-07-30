import { parseSearchId } from '$lib/utils';

export async function POST({ params, platform }) {
	const searchId = params.searchId;
	const comparison = parseSearchId(searchId);
	if (comparison.first !== null && comparison.second !== null) {
		const searchTimestamp = Date.now();
		const normalizedSearchId = [
			`${comparison.first.type}${comparison.first.id}`,
			`${comparison.second.type}${comparison.second.id}`
		]
			.sort()
			.join('');
		platform?.env?.SCREENCRED_SEARCH?.writeDataPoint({
			blobs: [searchId, normalizedSearchId],
			doubles: [1, searchTimestamp],
			indexes: [searchId]
		});
		return new Response(null, { status: 201 });
	}
	return new Response(null, { status: 400 });
}
