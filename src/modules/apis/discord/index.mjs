import { Router } from 'express'
import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'

const router = Router();

/**
 * @swagger
 * /discord/subscribe:
 *   get:
 *     summary: Subscribe to discord
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Missing access token
 */
router.get('/discord/subscribe', secureRouteMiddleware, login);
router.get('/discord/subscribe/app', secureRouteMiddleware, loginApp);

/**
 * @swagger
 * /discord/unsubscribe:
 *   get:
 *     summary: Unsubscribe from discord
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/discord/unsubscribe', secureRouteMiddleware, unsubscribe);

/**
 * @swagger
 * /discord/callback:
 *   get:
 *     summary: callback to store tokens
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/discord/callback', secureCallback, store_tokens);

/**
 * @swagger
 * /discord/refresh:
 *   get:
 *     summary: Subscribe to discord
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Missing access token
 */
router.get('/discord/refresh', secureRouteMiddleware, refresh);

export default router;