import { search } from '$lib/server/tmdb';
import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
	const query = url.searchParams.get('query');
	if (!query) {
		return new Response('No query provided', { status: 400 });
	}
	const data = await search(query);
	return json(data);
};
