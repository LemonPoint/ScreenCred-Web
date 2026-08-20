import { index, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const searchAnalytics = pgTable(
	'search_analytics',
	{
		id: serial().notNull(),
		searchId: varchar('search_id', { length: 255 }).notNull(),
		normalizedSearchId: varchar('normalized_search_id', { length: 255 }).notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()
	},
	(table) => [
		index('idx_search_analytics_normalized_search_id').using(
			'btree',
			table.normalizedSearchId.asc().nullsLast().op('text_ops')
		),
		index('idx_search_analytics_search_id').using(
			'btree',
			table.searchId.asc().nullsLast().op('text_ops')
		)
	]
);
