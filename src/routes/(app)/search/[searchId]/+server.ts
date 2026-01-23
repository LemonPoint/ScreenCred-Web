import { normalizeSearchId, parseSearchId } from '$lib/utils';
import sql from '$lib/server/db';

export async function POST({ params }) {
	const searchId = params.searchId;
	const comparison = parseSearchId(searchId);
	if (comparison.first !== null && comparison.second !== null) {
		const normalizedSearchId = normalizeSearchId(
			`${comparison.first.type}${comparison.first.id}`,
			`${comparison.second.type}${comparison.second.id}`
		);

		await sql`INSERT INTO search_analytics
		   (search_id, normalized_search_id)
		   VALUES (${searchId}, ${normalizedSearchId})`;
		return new Response(null, { status: 201 });
	}
	return new Response(null, { status: 400 });
}
