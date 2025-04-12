import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email'),
    name: text('name'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    title: text('title').notNull(),
    description: text('description'),
    userId: text('user_id').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const projectsRelations = relations(projects, ({ one }) => ({
    creator: one(users, {
        fields: [projects.userId],
        references: [users.id],
    }),
}));