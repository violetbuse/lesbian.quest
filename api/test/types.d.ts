import { Env } from '../src/types';

declare module 'cloudflare:test' {
    interface ProvidedEnv extends Env {
        TEST_MIGRATIONS: D1Migrations
        DB: D1Database
        CLERK_SECRET_KEY: string
        ENVIRONMENT: string
    }
}