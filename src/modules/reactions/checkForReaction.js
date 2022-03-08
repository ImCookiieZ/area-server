import db_adm_conn from "../db/index.js"
import { sendMessage as dc_message} from "../apis/discord/reactions.js"
import { sendMessage as tw_message} from "../apis/twitch/reactions.js"
import { addSongToPlaylist, addSongToQueue } from "../apis/spotify/reactions.js"
import { upvoteRedditPost } from "../apis/reddit/reactions.js"

export const handleReactions = (reactions) => {
    console.log(reactions)
    var executed = false
    for (var row of reactions) {
        switch (row.type) {
            case ('server-message'):
                dc_message(row)
                executed = true
                break;
            case ('song-to-playlist'):
                addSongToPlaylist(row)
                executed = true
                break;
            case ('song-to-queue'):
                addSongToQueue(row)
                executed = true
                break;
            case ('channel-message'):
                tw_message(row)
                executed = true
                break;
            case ('vote'):
                upvoteRedditPost(row)
                executed = true
                break;

            default:
                console.log('case not defined')
        }
    }
    return executed
    // await db_adm_conn.query(`
    // SELECT tr.trigger_reaction_id, r.name, x.argument1, x.argument2 FROM trigger_reactions WHERE user_trigger_id in (
    //     SELECT tr.trigger_reaction_id
    //     FROM trigger_reactions tr
    //     WHERE trigger 
    //         AND argument_value = 'pong' 
    //         AND user_trigger_id in (
    //             SELECT user_trigger_id
    //             FROM trigger_arguments
    //             WHERE argument_name = 'server_id' AND argument_value = '${checkInputBeforeSqlQuery(interaction.guild.id)}'
    //             ORDER BY user_trigger_id)
    //     ORDER BY user_trigger_id)
    // `)
    // SELECT trigger_reaction_id FROM trigger_reactions WHERE user_trigger_id in (
    //     SELECT user_trigger_id
    //     FROM trigger_arguments
    //     WHERE argument_name = 'commandname' 
    //         AND argument_value = 'pong' 
    //         AND user_trigger_id in (
    //             SELECT user_trigger_id
    //             FROM trigger_arguments
    //             WHERE argument_name = 'server_id' AND argument_value = '689443991783342116'
    //             ORDER BY user_trigger_id)
    //     ORDER BY user_trigger_id)

}