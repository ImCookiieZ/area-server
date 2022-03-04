import { Router } from 'express'
import { secureRouteMiddleware } from '../../middleware/security/secureRouting.js'
import { createDiscordMessage } from '../apis/discord/reactions.js'
import { createSongToPlaylist, createSongToQueue } from '../apis/spotify/reactions.js'
import { createChannelMessage } from '../apis/twitch/reactions.js';
const router = Router();

router.post('/reaction/discord/message', secureRouteMiddleware, createDiscordMessage);
router.post('/reaction/spotify/song_to_playlist', secureRouteMiddleware, createSongToPlaylist);
router.post('/reaction/spotify/song_to_queue', secureRouteMiddleware, createSongToQueue);
router.post('/reaction/twitch/message', secureRouteMiddleware, createChannelMessage)
export default router;