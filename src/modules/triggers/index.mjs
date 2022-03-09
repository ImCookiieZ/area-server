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
 *     discord_command:
 *       type: object
 *       properties:
 *         commandname:
 *           type: string
 *         server_id:
 *           type: string
 *     discord_join:
 *       type: object
 *       properties:
 *         server_id:
 *           type: string
 *     spotify_playlist:
 *       type: object
 *       properties:
 *         playlistid:
 *           type: string
 *     twitch_channel:
 *       type: object
 *       properties:
 *         commandname:
 *           type: string
 *         channel_name:
 *           type: string
 *     twitch_live:
 *       type: object
 *       properties:
 *         channel_name:
 *           type: string
 *     error_message:
 *       type: object
 *       properties:
 *         Error:
 *           type: string
 */

/**
 * @swagger
 * /trigger/discord/command:
 *   post:
 *     summary: add trigger discord command
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/discord_command'
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
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 *       500:
 *         description: internal server error
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 */
router.post('/trigger/discord/command', secureRouteMiddleware, createDiscordCommand);

/**
 * @swagger
 * /trigger/discord/join:
 *   post:
 *     summary: add trigger discord join
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/discord_join'
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
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 *       500:
 *         description: internal server error
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 */
router.post('/trigger/discord/join', secureRouteMiddleware, createDiscordJoin);

/**
 * @swagger
 * /trigger/spotify/playlist:
 *   post:
 *     summary: add trigger spotify playlist
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/spotify_playlist'
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
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 *       500:
 *         description: internal server error
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 */
router.post('/trigger/spotify/playlist', secureRouteMiddleware, createPlaylistSongAdded);

/**
 * @swagger
 * /trigger/twitch/command:
 *   post:
 *     summary: add trigger twitch command
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/twitch_channel'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 *       500:
 *         description: internal server error
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 */
router.post('/trigger/twitch/command', secureRouteMiddleware, createChannelCommand)

/**
 * @swagger
 * /trigger/twitch/live:
 *   post:
 *     summary: add trigger twitch live
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/twitch_live'
 *     parameters:
 *          - in: cookie
 *            name: token
 *            type: JWT
 *            required: true
 *            description: JWT user got on login
 *     responses:
 *       202:
 *         description: accepted
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/user_trigger_id'
 *       400:
 *         description: bad request
 *         content:
 *           application/json:
 *              schema:
 *                $ref: '#/components/schemas/error_message'
 */
router.post('/trigger/twitch/live', secureRouteMiddleware, createChannelLive)

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