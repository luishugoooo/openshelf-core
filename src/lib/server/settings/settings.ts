import { db } from '../db/index';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function getSettings(key: string): Promise<string | null> {
	const setting = await db.query.settings.findFirst({
		where: eq(settings.key, key)
	});
	return setting?.value ?? null;
}

export async function setSettings(key: string, value: string) {
	await db
		.insert(settings)
		.values({ key, value })
		.onConflictDoUpdate({
			target: [settings.key],
			set: { value }
		});
}
