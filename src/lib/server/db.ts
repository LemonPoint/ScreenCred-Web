import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './drizzle/relations';

const db = drizzle(env.DATABASE_URL!, {
	relations
});
export default db;
