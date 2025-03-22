import { Hono } from 'hono';
import progressRouter from './progress';

const router = new Hono();

router.route('/progress', progressRouter);

export default router; 