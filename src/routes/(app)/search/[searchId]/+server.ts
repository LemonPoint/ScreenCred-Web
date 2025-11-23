import { normalizeSearchId, parseSearchId } from '$lib/utils';

export async function POST({ params }) {
	const searchId = params.searchId;
	const comparison = parseSearchId(searchId);
	if (comparison.first !== null && comparison.second !== null) {
		const searchTimestamp = Date.now();
		const normalizedSearchId = normalizeSearchId(
			`${comparison.first.type}${comparison.first.id}`,
			`${comparison.second.type}${comparison.second.id}`
		);
		// await db.query(
		// 	`INSERT INTO search_analytics
		//    (search_id, normalized_search_id, count, timestamp, indexed_search_id)
		//    VALUES ($1, $2, $3, $4, $5)`,
		// 	[searchId, normalizedSearchId, 1, searchTimestamp, searchId]
		// );
		return new Response(null, { status: 201 });
	}
	return new Response(null, { status: 400 });
}
