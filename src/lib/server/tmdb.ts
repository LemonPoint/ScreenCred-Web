import { TMDB_API_KEY } from '$env/static/private';
import type {
	Credits,
	MediaDetails,
	MediaType,
	MovieCast,
	MovieCrew,
	PersonCast,
	PersonCrew,
	SearchResponse,
	TvShowCast,
	TvShowCrew
} from '../interfaces';
import { BASE_URL, camelize } from '../utils';

async function makeTMDBRequest<T>(url: string) {
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${TMDB_API_KEY}`
		}
	});

	const data = camelize(await response.json());
	if (data.success === false) {
		console.log(data.status_message);
		throw new Error('There was a problem fetching data.');
	}

	return data as T;
}

export async function search(query: string): Promise<SearchResponse> {
	const url = `${BASE_URL}/search/multi?query=${query}&include_adult=false&language=en-US&page=1`;
	return await makeTMDBRequest<SearchResponse>(url);
}

export async function getDetails(type: MediaType, id: number): Promise<MediaDetails> {
	if (type === 'person' && id === -1) {
		// TODO: return Sam
	}
	const url = `${BASE_URL}/${type}/${id}`;

	const data = await makeTMDBRequest<Omit<MediaDetails, 'mediaType'>>(url);
	return {
		...data,
		mediaType: type
	} as MediaDetails;
}

export async function getCredits(type: MediaType, id: number): Promise<Credits> {
	switch (type) {
		case 'movie':
			return getCreditsForMovie(id);
		case 'tv':
			return getCreditsForTvShow(id);
		case 'person':
			return getCreditsForPerson(id);
	}
}

function normalizeCharacter(character: string) {
	if (character.startsWith('Self') || ['', 'Himself', 'Herself'].includes(character)) {
		return 'Self';
	}
	return character;
}

async function getCreditsForMovie(id: number): Promise<Credits> {
	const url = `${BASE_URL}/movie/${id}/credits`;

	const { cast, crew } = await makeTMDBRequest<Credits<MovieCast, MovieCrew>>(url);

	return {
		cast: cast.map((c) => ({
			id: c.id,
			name: c.name,
			role: normalizeCharacter(c.character),
			profilePath: c.profilePath,
			type: 'person'
		})),
		crew: crew.map((c) => ({
			id: c.id,
			name: c.name,
			role: c.job,
			profilePath: c.profilePath,
			type: 'person'
		}))
	};
}

async function getCreditsForTvShow(id: number): Promise<Credits> {
	const url = `${BASE_URL}/tv/${id}/aggregate_credits`;

	const { cast, crew } = await makeTMDBRequest<Credits<TvShowCast, TvShowCrew>>(url);

	return {
		cast: cast.flatMap((c) =>
			c.roles.map(({ character }) => ({
				id: c.id,
				name: c.name,
				role: normalizeCharacter(character),
				profilePath: c.profilePath,
				type: 'person'
			}))
		),
		crew: crew.flatMap((c) =>
			c.jobs.map(({ job }) => ({
				id: c.id,
				name: c.name,
				role: job,
				profilePath: c.profilePath,
				type: 'person'
			}))
		)
	};
}

async function getCreditsForPerson(id: number): Promise<Credits> {
	if (id === -1) {
		// Sam
		return {
			cast: [],
			crew: []
		};
	}
	const url = `${BASE_URL}/person/${id}/combined_credits`;

	const { cast, crew } = await makeTMDBRequest<Credits<PersonCast, PersonCrew>>(url);

	return {
		cast: cast
			.map((c) => ({
				id: c.id,
				name: c.title ?? c.name ?? 'Unknown',
				role: normalizeCharacter(c.character),
				profilePath: c.profilePath,
				type: c.mediaType
			}))
			.filter((c) => {
				if (c.type === 'tv') {
					return c.role !== 'Self';
				}
			}),
		crew: crew.map((c) => ({
			id: c.id,
			name: c.title ?? c.name ?? 'Unknown',
			role: c.job,
			profilePath: c.profilePath,
			type: c.mediaType
		}))
	};
}
