import { Hono } from 'hono';
import progressRouter from './progress';
import adventuresRouter from './adventures';
import type { Env } from '../../types';

const router = new Hono<{ Bindings: Env }>();

router.route('/progress', progressRouter);
router.route('/adventures', adventuresRouter);

export default router; 