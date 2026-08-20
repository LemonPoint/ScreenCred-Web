import postgres from 'postgres';
import { env } from '$env/dynamic/private';

const sql = postgres(env.DATABASE_URL!);

await sql`
  CREATE TABLE IF NOT EXISTS "search_analytics" (
  	"id" serial NOT NULL,
  	"search_id" varchar(255) NOT NULL,
  	"normalized_search_id" varchar(255) NOT NULL,
  	"created_at" timestamp DEFAULT now()
  );
  `;
await sql`
  CREATE INDEX IF NOT EXISTS "idx_search_analytics_normalized_search_id" ON "search_analytics" USING btree("normalized_search_id" text_ops);
  `;
await sql`CREATE INDEX IF NOT EXISTS "idx_search_analytics_search_id" ON "search_analytics" USING btree ("search_id" text_ops);
  `;

export default sql;
