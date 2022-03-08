import { checkLiveTrigger } from "./twitchTrigger.js"
import { checkPlaylistTrigger } from "./spotifyTrigger.js"
import { checkPostOnFeedTrigger } from "../apis/reddit/triggers.js"
import { checkPostOnSubredditTrigger } from "../apis/reddit/postInSubreddit.js"
import { checkPostUpvote, checkPostDownvote, checkPostVotelimit, checkPostVoteChange } from "../apis/reddit/postVotesTrigger.js"
import { checkGithubPush, checkGithubPR } from "../apis/github/triggers.js"
import db_adm_conn from "../db/index.js"
import { refresh_function as dc_refresh} from "../apis/discord/tokens.js"
import { refresh_function as re_refresh} from "../apis/reddit/tokens.js"
import { refresh_function as sp_refresh} from "../apis/spotify/tokens.js"
import { refresh_function as tw_refresh} from "../apis/twitch/tokens.js"

const getValuesFromRows = async (rows) => {
    return await rows.filter((row) => {
        return Math.round(((new Date()).getTime() - 2) / 1000) >= row.expires_at - 300
    })
}

export const checkTokens = async () => {
    var rows = await db_adm_conn.query(`SELECT * FROM subscriptions su JOIN services se ON se.service_id = su.service_id`)
    var values = await getValuesFromRows(rows.rows)
    console.log(values)
    for (var line of values) {
        switch (line.service_name) {
            case ('discord'):
                await dc_refresh(line.user_id)
                break;
            case ('reddit'):
                await re_refresh(line.user_id)
                break;
            case ('spotify'):
                await sp_refresh(line.user_id)
                break;
            case ('twitch'):
                await tw_refresh(line.user_id)
                break;
        }
    }
}

const checkGithub = async () => {
    await checkGithubPush()
    await checkGithubPR();
}

const checkReddit = async () => {
    await checkPostOnSubredditTrigger()
    await checkPostOnFeedTrigger()
    await checkPostUpvote()
    await checkPostDownvote()
    await checkPostVotelimit()
    await checkPostVoteChange()
}

export const checkTriggers = async () => {
    try {
        await checkTokens()
        await checkPlaylistTrigger()
        // await checkQueueTrigger() not possible :(
        await checkLiveTrigger()
        await checkReddit();
        await checkGithub();
        setTimeout(checkTriggers, 2 * 60 * 1000)
    } catch {}
}