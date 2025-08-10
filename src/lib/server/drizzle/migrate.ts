import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { setSettings } from '../settings/settings';

const sqlite = new Database('openshelf.db');
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: './drizzle' });

setSettings('initialSetupComplete', 'false');
