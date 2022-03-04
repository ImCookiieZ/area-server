import { Router } from 'express'
import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'

const router = Router();

router.get('/discord/subscribe', secureRouteMiddleware, login);
router.get('/discord/subscribe/app', secureRouteMiddleware, loginApp);
router.get('/discord/unsubscribe', secureRouteMiddleware, unsubscribe);


router.get('/discord/callback', secureCallback, store_tokens);

router.get('/discord/refresh', secureRouteMiddleware, refresh);

export default router;