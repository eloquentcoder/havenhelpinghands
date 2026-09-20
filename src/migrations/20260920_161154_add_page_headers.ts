import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`page_headers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`programs_headline\` text,
  	\`programs_standfirst\` text,
  	\`programs_image_id\` integer,
  	\`blog_headline\` text,
  	\`blog_standfirst\` text,
  	\`blog_image_id\` integer,
  	\`events_headline\` text,
  	\`events_standfirst\` text,
  	\`events_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`programs_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`blog_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`events_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`page_headers_programs_programs_image_idx\` ON \`page_headers\` (\`programs_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_headers_blog_blog_image_idx\` ON \`page_headers\` (\`blog_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_headers_events_events_image_idx\` ON \`page_headers\` (\`events_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`page_headers\`;`)
}
