import type { MediaDetails } from '$lib/interfaces';

export const BASE_URL = 'https://api.themoviedb.org/3/';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function camelize(obj: any): any {
	if (obj === null || typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		return obj.map(camelize);
	}

	const result: any = {};
	for (const [key, value] of Object.entries(obj)) {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
		result[camelKey] = camelize(value);
	}
	return result;
}

function tmdbImageUrl(path: string | undefined, width = 500) {
	return path ? `${IMAGE_BASE_URL}w${width}${path}` : undefined;
}

function formatDate(date: string, locale?: string) {
	if (!date) {
		return null;
	}

	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(date));
}

export function mediaImage(details: MediaDetails, width = 500) {
	switch (details.mediaType) {
		case 'movie':
		case 'tv':
			return tmdbImageUrl(details.posterPath, width);
		case 'person':
			return tmdbImageUrl(details.profilePath, width);
	}
}

export function mediaTitle(details: MediaDetails) {
	switch (details.mediaType) {
		case 'movie':
			return details.title;
		case 'tv':
		case 'person':
			return details.name;
	}
}

export function mediaSubtitle(details: MediaDetails, locale?: string) {
	switch (details.mediaType) {
		case 'movie':
			return formatDate(details.releaseDate, locale);
		case 'tv':
			return formatDate(details.firstAirDate, locale);
		case 'person':
			return details.knownFor.map((d) => mediaTitle(d)).join(', ');
	}
}
