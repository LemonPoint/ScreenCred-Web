import { getPopularMovies, getPopularPeople, getPopularTvShows } from '$lib/server/tmdb';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	const data = await Promise.all([getPopularMovies(), getPopularTvShows(), getPopularPeople()]);
	return json(data);
};
