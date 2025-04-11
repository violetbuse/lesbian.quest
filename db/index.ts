import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function createClient() {
    const db = getCloudflareContext().env.DATABASE;
    return drizzle(db, { schema });
}

export type Database = ReturnType<typeof createClient>; 