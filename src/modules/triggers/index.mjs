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

router.post('/trigger/reddit/updateOnSubreddit', secureRouteMiddleware, createLastPostOnSubreddit)
router.post('/trigger/reddit/updateOnFeed', secureRouteMiddleware, createLastPostOnFeed)
router.post('/trigger/reddit/updateOnPostUpvote', secureRouteMiddleware, createPostUpvote)
router.post('/trigger/reddit/updateOnPostDownvote', secureRouteMiddleware, createPostDownvote)
router.post('/trigger/reddit/updateOnPostVotelimit', secureRouteMiddleware, createPostVotelimit)
router.post('/trigger/reddit/updateOnPostVote', secureRouteMiddleware, createPostVoteChanged)

router.post('/trigger/github/updateOnGithubPush', secureRouteMiddleware, createGithubPushTrigger);
router.post('/trigger/github/updateOnPullRequest', secureRouteMiddleware, createGithubPRTrigger);

router.delete('/connection/:id', secureRouteMiddleware, deleteConnection)

export default router;