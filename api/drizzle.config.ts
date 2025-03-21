import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db/schema.ts',
    out: './migrations',
    driver: 'd1',
    dbCredentials: {
        wranglerConfigPath: './wrangler.jsonc',
        dbName: 'lesbian_quest_db',
    },
} satisfies Config; 