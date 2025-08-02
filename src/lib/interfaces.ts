import z from 'zod';

export const MEDIA_TYPE_KEY = {
	m: 'movie',
	t: 'tv',
	p: 'person'
} as const;
export type MediaTypeKey = keyof typeof MEDIA_TYPE_KEY;

export type MediaType = 'movie' | 'tv' | 'person';

const BaseMediaDetailsSchema = z.object({
	id: z.number(),
	mediaType: z.string()
});

export const MovieDetailsSchema = BaseMediaDetailsSchema.extend({
	mediaType: z.literal('movie'),
	title: z.string(),
	posterPath: z.string(),
	releaseDate: z.string()
});

export const TVDetailsSchema = BaseMediaDetailsSchema.extend({
	mediaType: z.literal('tv'),
	name: z.string(),
	posterPath: z.string(),
	firstAirDate: z.string()
});

export const PersonDetailsSchema = BaseMediaDetailsSchema.extend({
	mediaType: z.literal('person'),
	name: z.string(),
	profilePath: z.string(),
	knownFor: z.array(z.string())
});

export const MediaDetailsSchema = z.discriminatedUnion('mediaType', [
	MovieDetailsSchema,
	TVDetailsSchema,
	PersonDetailsSchema
]);

export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
export type TVDetails = z.infer<typeof TVDetailsSchema>;
export type PersonDetails = z.infer<typeof PersonDetailsSchema>;
export type MediaDetails = z.infer<typeof MediaDetailsSchema>;

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
