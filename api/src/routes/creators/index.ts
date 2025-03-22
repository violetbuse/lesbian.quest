import { Hono } from 'hono';
import adventuresRouter from './adventures';
import scenesRouter from './scenes';
import choicesRouter from './choices';
import atomicRouter from './atomic';
import type { Env } from '../../types';

const router = new Hono<{ Bindings: Env }>();

router.route('/adventures', adventuresRouter);
router.route('/scenes', scenesRouter);
router.route('/choices', choicesRouter);
router.route('/atomic', atomicRouter);

export default router; 