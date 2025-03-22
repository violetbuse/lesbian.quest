import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    clerkId: text('clerk_id').notNull().unique(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    lastLogin: integer('last_login', { mode: 'timestamp' }),
});

export const adventures = sqliteTable('adventures', {
    id: text('id').primaryKey(),
    authorId: text('author_id')
        .notNull()
        .references(() => users.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const scenes = sqliteTable('scenes', {
    id: text('id').primaryKey(),
    adventureId: text('adventure_id')
        .notNull()
        .references(() => adventures.id),
    title: text('title').notNull(),
    content: text('content').notNull(),
    imageUrl: text('image_url'), // Optional image URL for the scene
    isStartScene: integer('is_start_scene', { mode: 'boolean' }).notNull().default(false),
    order: integer('order').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const choices = sqliteTable('choices', {
    id: text('id').primaryKey(),
    fromSceneId: text('from_scene_id')
        .notNull()
        .references(() => scenes.id),
    toSceneId: text('to_scene_id')
        .notNull()
        .references(() => scenes.id),
    text: text('text').notNull(),
    imageUrl: text('image_url'), // Optional image URL for the choice
    condition: text('condition'), // Optional JavaScript condition to evaluate
    order: integer('order').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const playerProgress = sqliteTable('player_progress', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    adventureId: text('adventure_id')
        .notNull()
        .references(() => adventures.id),
    currentSceneId: text('current_scene_id')
        .notNull()
        .references(() => scenes.id),
    variables: text('variables').notNull(), // JSON string of game variables
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
}); 