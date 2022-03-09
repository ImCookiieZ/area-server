import { Router } from 'express'
import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'
//import { createLastPostOnFeed } from './triggers.js'
//import { createLastPostOnSubreddit } from './postInSubreddit.js'
//import { createPostUpvote, createPostDownvote, createPostVotelimit, createPostVoteChanged } from './postVotesTrigger.js'

const router = Router();

/**
 * @swagger
 * /reddit/subscribe:
 *   get:
 *     summary: Subscribe to reddit
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
router.get('/reddit/subscribe', secureRouteMiddleware, login);
router.get('/reddit/subscribe/app', secureRouteMiddleware, loginApp);

/**
 * @swagger
 * /reddit/unsubscribe:
 *   get:
 *     summary: Unsubscribe from reddit
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
router.get('/reddit/unsubscribe', secureRouteMiddleware, unsubscribe);

/**
 * @swagger
 * /reddit/callback:
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
router.get('/reddit/callback', secureCallback, store_tokens);

/**
 * @swagger
 * /reddit/refresh:
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
router.get('/reddit/refresh', secureRouteMiddleware, refresh);

//router.get('/reddit/updateOnSubreddit', secureRouteMiddleware, createLastPostOnSubreddit)
//router.get('/reddit/updateOnFeed', secureRouteMiddleware, createLastPostOnFeed)
//router.get('/reddit/updateOnPostUpvote', secureRouteMiddleware, createPostUpvote)
//router.get('/reddit/updateOnPostDownvote', secureRouteMiddleware, createPostDownvote)
//router.get('/reddit/updateOnPostVotelimit', secureRouteMiddleware, createPostVotelimit)
//router.get('/reddit/updateOnPostVote', secureRouteMiddleware, createPostVoteChanged)


export default router;