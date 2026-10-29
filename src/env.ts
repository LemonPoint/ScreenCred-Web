import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

// The Docker build stage has no secrets, so allow the variables to be absent
// while building. They are required once the server starts.
const required = building ? z.string().optional() : z.string().min(1);

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'Postgres connection string',
		schema: required
	},
	TMDB_API_KEY: {
		description: 'TMDB API bearer token',
		schema: required
	}
});
