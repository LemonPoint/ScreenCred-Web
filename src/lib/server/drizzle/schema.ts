import { pgTable, serial, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const searchAnalytics = pgTable(
	'search_analytics',
	{
		id: serial().primaryKey(),
		searchId: varchar('search_id', { length: 255 }).notNull(),
		normalizedSearchId: varchar('normalized_search_id', { length: 255 }).notNull(),
		createdAt: timestamp('created_at').default(sql`now()`)
	},
	(table) => [
		index('idx_search_analytics_normalized_search_id').using(
			'btree',
			table.normalizedSearchId.asc().nullsLast()
		),
		index('idx_search_analytics_search_id').using('btree', table.searchId.asc().nullsLast())
	]
);
