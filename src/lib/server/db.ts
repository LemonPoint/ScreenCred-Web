import postgres from 'postgres';
import { DATABASE_URL } from '$app/env/private';

const sql = postgres(DATABASE_URL!);

export default sql;
