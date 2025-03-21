import { D1Database } from '@cloudflare/workers-types';

export interface Env {
    DB: D1Database;
    CLERK_SECRET_KEY: string;
}

export type Context = {
    Bindings: Env;
}; 