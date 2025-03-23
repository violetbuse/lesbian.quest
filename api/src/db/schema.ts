import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { InferModel, relations } from 'drizzle-orm';

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

export const favorites = sqliteTable('favorites', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    adventureId: text('adventure_id')
        .notNull()
        .references(() => adventures.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const likes = sqliteTable('likes', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    adventureId: text('adventure_id')
        .notNull()
        .references(() => adventures.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const saves = sqliteTable('saves', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    adventureId: text('adventure_id')
        .notNull()
        .references(() => adventures.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

// Types
export type User = InferModel<typeof users>;
export type Adventure = InferModel<typeof adventures>;
export type Scene = InferModel<typeof scenes>;
export type Choice = InferModel<typeof choices>;
export type PlayerProgress = InferModel<typeof playerProgress>;
export type Favorite = InferModel<typeof favorites>;
export type Like = InferModel<typeof likes>;
export type Save = InferModel<typeof saves>;

// Relations
export const adventuresRelations = relations(adventures, ({ one, many }: { one: any; many: any }) => ({
    author: one(users, {
        fields: [adventures.authorId],
        references: [users.id],
    }),
    scenes: many(scenes),
    favorites: many(favorites),
    likes: many(likes),
    saves: many(saves),
}));

export const scenesRelations = relations(scenes, ({ one, many }: { one: any; many: any }) => ({
    adventure: one(adventures, {
        fields: [scenes.adventureId],
        references: [adventures.id],
    }),
    fromChoices: many(choices, { relationName: 'fromScene' }),
    toChoices: many(choices, { relationName: 'toScene' }),
}));

export const choicesRelations = relations(choices, ({ one }: { one: any }) => ({
    fromScene: one(scenes, {
        fields: [choices.fromSceneId],
        references: [scenes.id],
        relationName: 'fromScene',
    }),
    toScene: one(scenes, {
        fields: [choices.toSceneId],
        references: [scenes.id],
        relationName: 'toScene',
    }),
}));

export const playerProgressRelations = relations(playerProgress, ({ one }: { one: any }) => ({
    user: one(users, {
        fields: [playerProgress.userId],
        references: [users.id],
    }),
    adventure: one(adventures, {
        fields: [playerProgress.adventureId],
        references: [adventures.id],
    }),
    currentScene: one(scenes, {
        fields: [playerProgress.currentSceneId],
        references: [scenes.id],
    }),
}));

export const favoritesRelations = relations(favorites, ({ one }: { one: any }) => ({
    user: one(users, {
        fields: [favorites.userId],
        references: [users.id],
    }),
    adventure: one(adventures, {
        fields: [favorites.adventureId],
        references: [adventures.id],
    }),
}));

export const likesRelations = relations(likes, ({ one }: { one: any }) => ({
    user: one(users, {
        fields: [likes.userId],
        references: [users.id],
    }),
    adventure: one(adventures, {
        fields: [likes.adventureId],
        references: [adventures.id],
    }),
}));

export const savesRelations = relations(saves, ({ one }: { one: any }) => ({
    user: one(users, {
        fields: [saves.userId],
        references: [users.id],
    }),
    adventure: one(adventures, {
        fields: [saves.adventureId],
        references: [adventures.id],
    }),
})); 