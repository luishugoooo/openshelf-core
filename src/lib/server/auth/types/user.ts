import type { users } from '../../db/schema';

type SelectUser = typeof users.$inferSelect;
type InsertUser = typeof users.$inferInsert;

export type { SelectUser, InsertUser };
