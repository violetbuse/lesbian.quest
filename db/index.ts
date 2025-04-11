import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createClient(d1: D1Database) {
    return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createClient>; 