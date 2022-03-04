import { Router } from 'express'

import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'

import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'

const router = Router();

router.get('/twitch/subscribe', secureRouteMiddleware, login);
router.get('/twitch/subscribe/App', secureRouteMiddleware, loginApp);
router.get('/twitch/unsubscribe', secureRouteMiddleware, unsubscribe);


router.get('/twitch/callback', secureCallback, store_tokens);

router.get('/twitch/refresh', secureRouteMiddleware, refresh);

export default router;