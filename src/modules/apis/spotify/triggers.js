import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from '../../Helper.js'
import { handleReactions } from '../../reactions/checkForReaction.js'
import { getClient } from './client.js'

export const checkForNewSongsInPlaylist = async (playlist) => {
    try {
        var client = await getClient(playlist.user_id)
        var response = await client.getPlaylist(playlist.playlistid)
        var res_songs = []
        var commands_res = await db_adm_conn.query(`
        SELECT tr.trigger_reaction_id as id, r.reaction_name as type
        FROM trigger_reactions tr
        JOIN reactions r ON tr.reaction_id = r.reaction_id
        JOIN user_trigger ut ON tr.user_trigger_id = ut.user_trigger_id
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        WHERE ut.user_trigger_id = '${playlist.user_trigger_id}' 
        `)
        for (var item of response.body.tracks.items) {
            if ((new Date(item.added_at)).getTime() / 1000 > playlist.lastchecked)
                res_songs.push({
                    id: commands_res.rows[0].id,
                    type:  commands_res.rows[0].type,
                    message: `${item.track.name} got added to ${response.body.name} at ${item.added_at} from ${item.added_by.id}`,
                    argument: item.track.external_urls.spotify
                })
        }
        handleReactions(res_songs)
    } catch (err) {
        console.log(err.stack)
    }
}
export const createPlaylistSongAdded = async (req, res) => {
    try {
        var userid = req.user.userid
        var client = await getClient(userid)
        var playlist_link = req.body.song_link
        var prefix = "https://open.spotify.com/playlist/"
        var playlistid = playlist_link.substring(playlist_link.indexOf(prefix) + prefix.length, playlist_link.indexOf('?'))
        try {
            await client.getPlaylist(playlistid)
        } catch(err) {
            res.status(400).send(createErrorMessage('playlist id does not exist'))
            return
        }
        var trigger_id = await getTriggerId('song-playlist')
        var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO user_trigger(user_id, trigger_id)
        VALUES ('${userid}', '${trigger_id}')
        RETURNING user_trigger_id`);
        var user_trigger_id = user_trigger_id_res.rows[0].user_trigger_id
        var querystr = `
        INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
        VALUES
            ('${user_trigger_id}', 'lastchecked', '${((new Date()).getTime() - 2) / 1000}'),
            ('${user_trigger_id}', 'playlistid', '${checkInputBeforeSqlQuery(playlistid)}')`
        await db_adm_conn.query(querystr);
        res.status(201).send({ user_trigger_id: user_trigger_id_res.rows[0].user_trigger_id })
    } catch (err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

// export const checkForNewSongsInQueue = async (args) => {
//     var client = await getClient(args.user_id)
//     var response = await client.getMyCurrentPlaybackState()
//     var res_songs = []
//     var commands_res = await db_adm_conn.query(`
//     SELECT tr.trigger_reaction_id as id, r.reaction_name as type
//     FROM trigger_reactions tr
//     JOIN reactions r ON tr.reaction_id = r.reaction_id
//     JOIN user_trigger ut ON tr.user_trigger_id = ut.user_trigger_id
//     JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
//     WHERE ut.user_trigger_id = '${args.user_trigger_id}' 
//     `)
//     console.log(response.body)
//     for (var item of response.body.tracks.items) {
//         if ((new Date(item.added_at)).getTime() / 1000 > args.lastchecked)
//             res_songs.push({
//                 id: commands_res.rows[0].id,
//                 type:  commands_res.rows[0].type,
//                 message: `${item.track.name} got added to queue at ${item.added_at} from ${item.added_by.id}`,
//                 argument: item.track.href
//             })
//     }
//     handleReactions(res_songs)
// }

// export const createQueueSongAdded = async (req, res) => {
//     var userid = req.user.userid
//     var trigger_id = await getTriggerId('song-queue')
//     var user_trigger_id_res = await db_adm_conn.query(`
//     INSERT INTO user_trigger(user_id, trigger_id)
//     VALUES ('${userid}', '${trigger_id}')
//     RETURNING user_trigger_id`);
//     var user_trigger_id = user_trigger_id_res.rows[0].user_trigger_id
//     var querystr = `
//     INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
//     VALUES
//         ('${user_trigger_id}', 'lastchecked', '${((new Date()).getTime() - 2) / 1000}')`
//     await db_adm_conn.query(querystr);
//     res.status(201).send({ user_trigger_id: user_trigger_id_res.rows[0].user_trigger_id })
// }
