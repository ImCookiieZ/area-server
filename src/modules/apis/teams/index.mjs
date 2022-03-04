import { Router } from 'express'
import { login, refresh, store_tokens } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'

const router = Router();

router.get('/discord/subscribe', secureRouteMiddleware, login);


router.get('/discord/callback', secureCallback, store_tokens);

router.get('/discord/refresh', secureRouteMiddleware, refresh);

export default router;