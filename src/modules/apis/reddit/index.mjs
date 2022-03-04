import { Router } from 'express'
import { login, refresh, store_tokens, unsubscribe, loginApp } from './tokens.js'
import { secureRouteMiddleware, secureCallback } from '../../../middleware/security/secureRouting.js'
//import { createLastPostOnFeed } from './triggers.js'
//import { createLastPostOnSubreddit } from './postInSubreddit.js'
//import { createPostUpvote, createPostDownvote, createPostVotelimit, createPostVoteChanged } from './postVotesTrigger.js'

const router = Router();

router.get('/reddit/subscribe', secureRouteMiddleware, login);
router.get('/reddit/subscribe/app', secureRouteMiddleware, loginApp);
router.get('/reddit/unsubscribe', secureRouteMiddleware, unsubscribe);

router.get('/reddit/callback', secureCallback, store_tokens);
router.get('/reddit/refresh', secureRouteMiddleware, refresh);

//router.get('/reddit/updateOnSubreddit', secureRouteMiddleware, createLastPostOnSubreddit)
//router.get('/reddit/updateOnFeed', secureRouteMiddleware, createLastPostOnFeed)
//router.get('/reddit/updateOnPostUpvote', secureRouteMiddleware, createPostUpvote)
//router.get('/reddit/updateOnPostDownvote', secureRouteMiddleware, createPostDownvote)
//router.get('/reddit/updateOnPostVotelimit', secureRouteMiddleware, createPostVotelimit)
//router.get('/reddit/updateOnPostVote', secureRouteMiddleware, createPostVoteChanged)


export default router;