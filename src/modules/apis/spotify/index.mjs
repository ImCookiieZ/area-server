import { Router } from 'express'
import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'
import { searchForPlaylist } from './client.js'
import { createSongToPlaylist, createSongToQueue } from './reactions.js'
const router = Router();

router.get('/spotify/subscribe', secureRouteMiddleware, login);
router.get('/spotify/subscribe/app', secureRouteMiddleware, loginApp);
router.get('/spotify/unsubscribe', secureRouteMiddleware, unsubscribe);

router.get('/spotify/callback', secureCallback, store_tokens);

router.get('/spotify/refresh', secureRouteMiddleware, refresh);


router.get('/spotify/playlist', secureRouteMiddleware, searchForPlaylist);

export default router;