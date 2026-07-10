import { getPopularMovies, getPopularPeople, getPopularTvShows } from '$lib/server/tmdb';
import { json } from '@sveltejs/kit';

const CACHE_TTL = 5 * 60 * 1000;

let cache: Awaited<ReturnType<typeof fetchPopular>> | null = null;
let fetchedAt = 0;
let refreshing = false;

async function fetchPopular() {
	const data = Promise.all([getPopularMovies(), getPopularTvShows(), getPopularPeople()]);
	fetchedAt = Date.now();
	return data;
}

async function getPopularCached() {
	if (!cache) {
		cache = await fetchPopular();
		return cache;
	}

	if (Date.now() - fetchedAt > CACHE_TTL && !refreshing) {
		refreshing = true;
		fetchPopular()
			.then((data) => {
				cache = data;
			})
			.finally(() => {
				refreshing = false;
			});
	}

	return cache;
}

export const GET = async ({ setHeaders }) => {
	const data = await getPopularCached();
	setHeaders({
		'cache-control': 'public, max-age=300, s-maxage=3600'
	});
	return json(data);
};
