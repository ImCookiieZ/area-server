import { Router } from 'express'
import { login, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'
//import { createGithubPushTrigger, createGithubPRTrigger } from './triggers.js'

const router = Router();

/**
 * @swagger
 * /github/subscribe:
 *   get:
 *     summary: Subscribe to github
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
router.get('/github/subscribe', secureRouteMiddleware, login);
router.get('/github/subscribe/app', secureRouteMiddleware, loginApp);

/**
 * @swagger
 * /github/unsubscribe:
 *   get:
 *     summary: Unsubscribe from github
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
router.get('/github/unsubscribe', secureRouteMiddleware, unsubscribe);

/**
 * @swagger
 * /github/callback:
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
router.get('/github/callback', secureCallback, store_tokens);

/**
 * @swagger
 * /github/refresh:
 *   get:
 *     summary: refresh tokens
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
router.get('/github/refresh', secureRouteMiddleware, login);

//router.get('/github/updateOnGithubPush', secureRouteMiddleware, createGithubPushTrigger);
//router.get('/github/updateOnPullRequest', secureRouteMiddleware, createGithubPRTrigger);

export default router;