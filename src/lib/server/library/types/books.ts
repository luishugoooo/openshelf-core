import type { books } from '../../db/schema';

export type Book = typeof books.$inferSelect;
