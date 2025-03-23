import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import creatorsRouter from './routes/creators/index';
import playersRouter from './routes/players/index';
import type { Env } from './types';
import { clerkMiddleware } from '@hono/clerk-auth';

// Create the app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());
app.use('*', clerkMiddleware())

// Health check
app.get('/', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/api/creators', creatorsRouter);
app.route('/api/players', playersRouter);

// Error handling
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: 'Internal Server Error' }, 500);
});

export default app; 