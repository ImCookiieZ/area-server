import { Router } from 'express'
import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'
import { searchForPlaylist } from './client.js'
import { createSongToPlaylist, createSongToQueue } from './reactions.js'
const router = Router();

/**
 * @swagger
 * /spotify/subscribe:
 *   get:
 *     summary: Subscribe to spotify
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
router.get('/spotify/subscribe', secureRouteMiddleware, login);
router.get('/spotify/subscribe/app', secureRouteMiddleware, loginApp);

/**
 * @swagger
 * /spotify/unsubscribe:
 *   get:
 *     summary: Unsubscribe from spotify
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
router.get('/spotify/unsubscribe', secureRouteMiddleware, unsubscribe);

/**
 * @swagger
 * /spotify/callback:
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
router.get('/spotify/callback', secureCallback, store_tokens);

/**
 * @swagger
 * /spotify/refresh:
 *   get:
 *     summary: Subscribe to spotify
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
router.get('/spotify/refresh', secureRouteMiddleware, refresh);


router.get('/spotify/playlist', secureRouteMiddleware, searchForPlaylist);

export default router;