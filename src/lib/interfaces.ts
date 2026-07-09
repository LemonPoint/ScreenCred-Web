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
	mediaType: z.string(),
	popularity: z.number().nullish()
});

export const MovieDetailsSchema = BaseMediaDetailsSchema.extend({
	mediaType: z.literal('movie'),
	title: z.string(),
	posterPath: z.string().nullish(),
	releaseDate: z.string()
});

export const TVDetailsSchema = BaseMediaDetailsSchema.extend({
	mediaType: z.literal('tv'),
	name: z.string(),
	posterPath: z.string().nullish(),
	firstAirDate: z.string()
});

export const PersonDetailsSchema = BaseMediaDetailsSchema.extend({
	mediaType: z.literal('person'),
	name: z.string(),
	profilePath: z.string().nullish(),
	knownFor: z.optional(
		z.array(z.discriminatedUnion('mediaType', [MovieDetailsSchema, TVDetailsSchema]))
	)
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
	popularity?: number;
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
	popularity?: number;
}

export interface MovieCrew {
	id: number;
	name: string;
	creditId: string;
	knownForDepartment: string;
	department: string;
	job: string;
	profilePath?: string;
	popularity?: number;
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
	popularity?: number;
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
	popularity?: number;
}

export interface PersonCast {
	id: number;
	title?: string;
	name?: string;
	releaseDate?: Date;
	creditId: string;
	character: string;
	posterPath?: string;
	mediaType: 'movie' | 'tv';
	popularity?: number;
}

export interface PersonCrew {
	id: number;
	title?: string;
	name?: string;
	releaseDate?: Date;
	creditId: string;
	department: string;
	job: string;
	posterPath?: string;
	mediaType: 'movie' | 'tv';
	popularity?: number;
}

export const PagedResponseSchema = <T extends z.ZodType>(item: T) => {
	return z.object({
		page: z.number(),
		results: z.array(item),
		totalPages: z.number(),
		totalResults: z.number()
	});
};

export interface PagedResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

export const SearchResponseSchema = PagedResponseSchema(MediaDetailsSchema);
export const PopularResponseSchema = z.array(PagedResponseSchema(MediaDetailsSchema));
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type PopularResponse = z.infer<typeof PopularResponseSchema>;

export interface ParsedCredit {
	role: string;
	modifiers?: string[];
}
