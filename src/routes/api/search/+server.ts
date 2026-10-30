import { search } from '#lib/server/tmdb.ts';

export const GET = async ({ url }) => {
	const query = url.searchParams.get('query');
	if (!query) {
		return new Response('No query provided', { status: 400 });
	}
	const data = await search(query);
	return Response.json(data);
};
