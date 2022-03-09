import { Router } from 'express'

import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'

import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'

const router = Router();

/**
 * @swagger
 * /twitch/subscribe:
 *   get:
 *     summary: Subscribe to twitch
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
router.get('/twitch/subscribe', secureRouteMiddleware, login);
router.get('/twitch/subscribe/App', secureRouteMiddleware, loginApp);

/**
 * @swagger
 * /twitch/unsubscribe:
 *   get:
 *     summary: Unsubscribe from twitch
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
router.get('/twitch/unsubscribe', secureRouteMiddleware, unsubscribe);

/**
 * @swagger
 * /twitch/callback:
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
router.get('/twitch/callback', secureCallback, store_tokens);

/**
 * @swagger
 * /twitch/refresh:
 *   get:
 *     summary: Subscribe to twitch
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
router.get('/twitch/refresh', secureRouteMiddleware, refresh);

export default router;