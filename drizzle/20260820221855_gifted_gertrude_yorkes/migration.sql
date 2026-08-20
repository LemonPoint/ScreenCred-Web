-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "search_analytics" (
	"id" serial NOT NULL,
	"search_id" varchar(255) NOT NULL,
	"normalized_search_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
*/
--> statement-breakpoint
/*
CREATE INDEX "idx_search_analytics_normalized_search_id" ON "search_analytics" USING btree ("normalized_search_id" text_ops);
*/
--> statement-breakpoint
/*
CREATE INDEX "idx_search_analytics_search_id" ON "search_analytics" USING btree ("search_id" text_ops);
*/
