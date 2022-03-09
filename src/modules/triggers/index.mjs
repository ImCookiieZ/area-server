import { Router } from 'express'
import { secureRouteMiddleware } from '../../middleware/security/secureRouting.js'
import { createDiscordCommand, createDiscordJoin } from '../apis/discord/triggers.js'
import { createPlaylistSongAdded } from '../apis/spotify/triggers.js'
import { createChannelCommand, createChannelLive } from '../apis/twitch/triggers.js'
import { deleteConnection } from './connection.js'

//reddit
import { createLastPostOnFeed } from './../apis/reddit/triggers.js'
import { createLastPostOnSubreddit } from './../apis/reddit/postInSubreddit.js'
import { createPostUpvote, createPostDownvote, createPostVotelimit, createPostVoteChanged } from './../apis/reddit/postVotesTrigger.js'

//github
import { createGithubPushTrigger, createGithubPRTrigger } from './../apis/github/triggers.js'


const router = Router();

router.post('/trigger/discord/command', secureRouteMiddleware, createDiscordCommand);
router.post('/trigger/discord/join', secureRouteMiddleware, createDiscordJoin);
router.post('/trigger/spotify/playlist', secureRouteMiddleware, createPlaylistSongAdded);
router.post('/trigger/twitch/command', secureRouteMiddleware, createChannelCommand)
router.post('/trigger/twitch/live', secureRouteMiddleware, createChannelLive)


/**
 * @swagger
 * components:
 *   schemas:
 *     Subreddit:
 *       type: object
 *       properties:
 *         subreddit:
 *           type: string
 *     user_trigger_id:
 *       type: object
 *       properties:
 *         user_trigger_id:
 *           type: string
 *     post_id:
 *       type: object
 *       properties:
 *         post_id:
 *           type: string
 *     votelimit:
 *       type: object
 *       properties:
 *         post_id:
 *           type: string
 *         votelimit:
 *           type: number
 *     github_info:
 *       type: object
 *       properties:
 *         github_username:
 *           type: string
 *         github_repo_name:
 *           type: string
 */

/**
 * @swagger
 * /trigger/reddit/updateOnSubreddit:
 *   post:
 *     summary: add trigger updateOnSubreddit
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Subreddit'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/reddit/updateOnSubreddit', secureRouteMiddleware, createLastPostOnSubreddit)

/**
 * @swagger
 * /trigger/reddit/updateOnFeed:
 *   post:
 *     summary: add trigger updateOnFeed
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/reddit/updateOnFeed', secureRouteMiddleware, createLastPostOnFeed)

/**
 * @swagger
 * /trigger/reddit/updateOnPostUpvote:
 *   post:
 *     summary: add trigger updateOnPostUpvote
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/post_id'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/reddit/updateOnPostUpvote', secureRouteMiddleware, createPostUpvote)

/**
 * @swagger
 * /trigger/reddit/updateOnPostDownvote:
 *   post:
 *     summary: add trigger updateOnPostDownvote
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/post_id'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/reddit/updateOnPostDownvote', secureRouteMiddleware, createPostDownvote)

/**
 * @swagger
 * /trigger/reddit/updateOnPostVotelimit:
 *   post:
 *     summary: add trigger updateOnPostVotelimit
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/votelimit'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/reddit/updateOnPostVotelimit', secureRouteMiddleware, createPostVotelimit)

/**
 * @swagger
 * /trigger/reddit/updateOnPostVote:
 *   post:
 *     summary: add trigger updateOnPostVote
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/post_id'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/reddit/updateOnPostVote', secureRouteMiddleware, createPostVoteChanged)

/**
 * @swagger
 * /trigger/github/updateOnGithubPush:
 *   post:
 *     summary: add trigger updateOnGithubPush
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/github_info'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/github/updateOnGithubPush', secureRouteMiddleware, createGithubPushTrigger);

/**
 * @swagger
 * /trigger/github/updateOnPullRequest:
 *   post:
 *     summary: add trigger updateOnPullRequest
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/github_info'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       401:
 *         description: unauthorized
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 */
router.post('/trigger/github/updateOnPullRequest', secureRouteMiddleware, createGithubPRTrigger);

router.delete('/connection/:id', secureRouteMiddleware, deleteConnection)

export default router;