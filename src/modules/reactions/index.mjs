import { Router } from 'express'
import { secureRouteMiddleware } from '../../middleware/security/secureRouting.js'
import { createDiscordMessage } from '../apis/discord/reactions.js'
import { createSongToPlaylist, createSongToQueue } from '../apis/spotify/reactions.js'
import { createChannelMessage } from '../apis/twitch/reactions.js';
import { createRedditUpvote } from '../apis/reddit/reactions.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     user_trigger_id:
 *       type: object
 *       properties:
 *         user_trigger_id:
 *           type: string
 *     error_message:
 *       type: object
 *       properties:
 *         Error:
 *           type: string
 *     discord_message:
 *       type: object
 *       properties:
 *         channel_id:
 *           type: string
 *         trigger_reaction_name:
 *           type: string
 *         message_string:
 *           type: string
 *         user_trigger_id:
 *           type: string
 *     spotify_song_to_playlist:
 *       type: object
 *       properties:
 *         playlistid:
 *           type: string
 *         trigger_reaction_name:
 *           type: string
 *         user_trigger_id:
 *           type: string
 *     spotify_song_to_queue:
 *       type: object
 *       properties:
 *         trigger_reaction_name:
 *           type: string
 *         user_trigger_id:
 *           type: string
 *     twitch_message:
 *       type: object
 *       properties:
 *         channel_name:
 *           type: string
 *         trigger_reaction_name:
 *           type: string
 *         user_trigger_id:
 *           type: string
 *         message_string:
 *           type: string
 *     reddit_post:
 *       type: object
 *       properties:
 *         post_id:
 *           type: string
 *         trigger_reaction_name:
 *           type: string
 *         user_trigger_id:
 *           type: string
 */

/**
 * @swagger
 * /reaction/discord/message:
 *   post:
 *     summary: add reaction discord message
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/discord_message'
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
router.post('/reaction/discord/message', secureRouteMiddleware, createDiscordMessage);

/**
 * @swagger
 * /reaction/spotify/song_to_playlist:
 *   post:
 *     summary: add reaction spotify song to playlist
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/spotify_song_to_playlist'
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
router.post('/reaction/spotify/song_to_playlist', secureRouteMiddleware, createSongToPlaylist);

/**
 * @swagger
 * /reaction/spotify/song_to_queue:
 *   post:
 *     summary: add reaction spotify song to queue
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/spotify_song_to_queue'
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
router.post('/reaction/spotify/song_to_queue', secureRouteMiddleware, createSongToQueue);

/**
 * @swagger
 * /reaction/twitch/message:
 *   post:
 *     summary: add reaction twitch message
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/twitch_message'
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
router.post('/reaction/twitch/message', secureRouteMiddleware, createChannelMessage)

/**
 * @swagger
 * /reaction/reddit/upvotePost:
 *   post:
 *     summary: add reaction reddit upvote post
 *     requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/reddit_post'
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
router.post('/reaction/reddit/upvotePost', secureRouteMiddleware, createRedditUpvote);

export default router;