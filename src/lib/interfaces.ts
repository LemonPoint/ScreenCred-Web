export const MEDIA_TYPE_KEY = {
	m: 'movie',
	t: 'tv',
	p: 'person'
} as const;
export type MediaTypeKey = keyof typeof MEDIA_TYPE_KEY;

export type MediaType = 'movie' | 'tv' | 'person';

export interface BaseMediaDetails {
	id: number;
	mediaType: MediaType;
}

export interface MovieDetails extends BaseMediaDetails {
	mediaType: 'movie';
	title: string;
	posterPath: string;
	releaseDate: string;
}

export interface TVDetails extends BaseMediaDetails {
	mediaType: 'tv';
	name: string;
	posterPath: string;
	firstAirDate: string;
}

export interface PersonDetails extends BaseMediaDetails {
	mediaType: 'person';
	name: string;
	profilePath: string;
	knownFor: MediaDetails[];
}

export type MediaDetails = MovieDetails | TVDetails | PersonDetails;

export interface SimpleCredit {
	id: number;
	name: string;
	role: string;
	profilePath?: string;
	type: MediaType;
}

export interface Credits<Cast = SimpleCredit, Crew = SimpleCredit> {
	cast: Cast[];
	crew: Crew[];
}

export interface MovieCast {
	id: number;
	name: string;
	creditId: string;
	character: string;
	knownForDepartment: string;
	profilePath?: string;
}

export interface MovieCrew {
	id: number;
	name: string;
	creditId: string;
	knownForDepartment: string;
	department: string;
	job: string;
	profilePath?: string;
}

export interface TvShowRole {
	creditId: string;
	character: string;
	profilePath?: string;
}

export interface TvShowCast {
	id: number;
	name: string;
	roles: TvShowRole[];
	knownForDepartment: string;
	profilePath?: string;
}

export interface TvShowJob {
	creditId: string;
	job: string;
}

export interface TvShowCrew {
	id: number;
	name: string;
	knownForDepartment: string;
	department: string;
	jobs: TvShowJob[];
	profilePath?: string;
}

export interface PersonCast {
	id: number;
	title?: string;
	name?: string;
	releaseDate?: Date;
	creditId: string;
	character: string;
	profilePath?: string;
	mediaType: 'movie' | 'tv';
}

export interface PersonCrew {
	id: number;
	title?: string;
	name?: string;
	releaseDate?: Date;
	creditId: string;
	department: string;
	job: string;
	profilePath?: string;
	mediaType: 'movie' | 'tv';
}

export interface PagedResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

export type SearchResponse = PagedResponse<MediaDetails>;
