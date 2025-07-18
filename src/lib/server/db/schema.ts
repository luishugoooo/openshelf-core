import { sqliteTable, integer, text, int, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
type role = 'admin' | 'user';
type bookType = 'epub';
export const users = sqliteTable('users', {
	id: int().primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	password: text('password').notNull(),
	username: text('username'),
	role: text('role').$type<role>().notNull().default('user'),
	refreshToken: text('refresh_token'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const settings = sqliteTable('settings', {
	key: text('key').primaryKey().notNull(),
	value: text('value').notNull()
});

export const books = sqliteTable('books', {
	id: int().primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	author: text('author'),
	publisher: text('publisher'),
	filePath: text('file_path').notNull(),
	year: integer('year').notNull(),
	type: text('type').$type<bookType>().notNull(),
	cover: blob('cover', { mode: 'buffer' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export const user_readings = sqliteTable('user_readings', {
	user_id: int('user_id').references(() => users.id),
	book_id: int('book_id').references(() => books.id),
	progress: text('progress'),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull()
});
