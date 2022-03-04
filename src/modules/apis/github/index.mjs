import { Router } from 'express'
import { login, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'
//import { createGithubPushTrigger, createGithubPRTrigger } from './triggers.js'

const router = Router();

router.get('/github/subscribe', secureRouteMiddleware, login);
router.get('/github/subscribe/app', secureRouteMiddleware, loginApp);
router.get('/github/unsubscribe', secureRouteMiddleware, unsubscribe);


router.get('/github/callback', secureCallback, store_tokens);

router.get('/github/refresh', secureRouteMiddleware, login);

//router.get('/github/updateOnGithubPush', secureRouteMiddleware, createGithubPushTrigger);
//router.get('/github/updateOnPullRequest', secureRouteMiddleware, createGithubPRTrigger);

export default router;