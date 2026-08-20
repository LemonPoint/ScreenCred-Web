import { defineConfig } from 'drizzle-kit';
console.log(process.env.DATABASE_URL);
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/server/drizzle/schema.ts',
	out: './src/lib/server/drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
