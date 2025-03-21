import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Import routes
import adventures from './routes/adventures.js';
import scenes from './routes/scenes.js';
import choices from './routes/choices.js';
import progress from './routes/progress.js';

// Create the app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// Health check
app.get('/', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/api/adventures', adventures);
app.route('/api/scenes', scenes);
app.route('/api/choices', choices);
app.route('/api/progress', progress);

// Error handling
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: 'Internal Server Error' }, 500);
});

export default app; 