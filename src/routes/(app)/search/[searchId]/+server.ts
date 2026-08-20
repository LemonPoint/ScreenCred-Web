import { normalizeSearchId, parseSearchId } from '$lib/utils';
import { searchAnalytics } from '$lib/server/drizzle/schema.js';
import getDb from '$lib/server/db';

const db = getDb();

export async function POST({ params }) {
	const searchId = params.searchId;
	const comparison = parseSearchId(searchId);
	if (comparison.first !== null && comparison.second !== null) {
		const normalizedSearchId = normalizeSearchId(
			`${comparison.first.type}${comparison.first.id}`,
			`${comparison.second.type}${comparison.second.id}`
		);

		await db.insert(searchAnalytics).values({
			searchId,
			normalizedSearchId
		});
		return new Response(null, { status: 201 });
	}
	return new Response(null, { status: 400 });
}
