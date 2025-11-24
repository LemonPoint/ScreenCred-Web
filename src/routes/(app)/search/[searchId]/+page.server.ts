import { MEDIA_TYPE_KEY } from '$lib/interfaces';
import { getDetails } from '$lib/server/tmdb';
import { compare } from '$lib/server/comparison';
import { redirect } from '@sveltejs/kit';
import { parseSearchId } from '$lib/utils';

export const load = async ({ params }) => {
	const comparison = parseSearchId(params.searchId);

	if (comparison.first !== null && comparison.second !== null) {
		if (
			comparison.first.id === comparison.second.id &&
			comparison.first.type === comparison.second.type
		) {
			redirect(307, '/');
		}
		const [first, second] = await Promise.all([
			getDetails(MEDIA_TYPE_KEY[comparison.first.type], parseInt(comparison.first.id)),
			getDetails(MEDIA_TYPE_KEY[comparison.second.type], parseInt(comparison.second.id))
		]);
		return {
			first,
			second,
			results: await compare(first, second)
		};
	}
	redirect(307, '/');
};
