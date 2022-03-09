import db_adm_conn from '../../db/index.js'
import { getReactionId } from '../../db/reaction.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from "../../Helper.js"
import { getClient } from './client.js'
export const createSongToPlaylist = async (req, res) => {
    try {
    // const songlink = req.body.songlink
        var playlist_link = req.body.playlist_link
        var prefix = "https://open.spotify.com/playlist/"
        var playlistid = playlist_link.substring(playlist_link.indexOf(prefix) + prefix.length, playlist_link.indexOf('?'))
        console.log(playlistid)
        const trigger_reaction_name = req.body.trigger_reaction_name
        const user_trigger_id = req.body.user_trigger_id
        try {
            await client.getPlaylist(playlistid)
        } catch(err) {
            console.log(err)
            res.status(400).send(createErrorMessage('playlist id does not exist'))
            return
        }
        const reacton_id = await getReactionId('song-to-playlist')

        var trigger_reaction_id_res = await db_adm_conn.query(`
        INSERT INTO trigger_reactions (user_trigger_id, reaction_id, trigger_reaction_name)
        VALUES ('${checkInputBeforeSqlQuery(user_trigger_id)}', '${checkInputBeforeSqlQuery(reacton_id)}',  '${checkInputBeforeSqlQuery(trigger_reaction_name)}')
        RETURNING trigger_reaction_id`)
        var trigger_reaction_id = trigger_reaction_id_res.rows[0].trigger_reaction_id
        var arguments_res = await db_adm_conn.query(`
        INSERT INTO reaction_arguments (argument_name, argument_value, trigger_reaction_id)
        VALUES ('playlist_id', '${checkInputBeforeSqlQuery(playlistid)}', '${checkInputBeforeSqlQuery(trigger_reaction_id)}')`)
        res.sendStatus(201)
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

export const addSongToPlaylist = async (row) => {
    try {
        var trigger_reaction_id = row.id
        var song_link = row.argument
        var user_id_res = await db_adm_conn.query(`
        SELECT u.user_id
        FROM users u
        JOIN user_trigger ut ON ut.user_id = u.user_id
        JOIN trigger_reactions tr ON tr.user_trigger_id = ut.user_trigger_id 
        WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)
        var client = await getClient(user_id_res.rows[0].user_id)
        var playlist_id
        var argument_res = await db_adm_conn.query(`
        SELECT ra.argument_name, ra.argument_value
        FROM reaction_arguments ra
        WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)
        playlist_id = argument_res.rows[0].argument_value
        try {
            var prefix = "https://open.spotify.com/track/"
            var track_uri = "spotify:track:" + song_link.substring(song_link.indexOf(prefix) + prefix.length, song_link.indexOf('?'))
            await client.addTracksToPlaylist(playlist_id, [track_uri])
        } catch(err){
            console.log(err)
        }
    } catch (err) {
        console.log(err.stack)
    }
}

export const createSongToQueue = async (req, res) => {
    try {
    // const songlink = req.body.songlink
        const trigger_reaction_name = req.body.trigger_reaction_name
        const user_trigger_id = req.body.user_trigger_id

        const reacton_id = await getReactionId('song-to-queue')

        var trigger_reaction_id_res = await db_adm_conn.query(`
        INSERT INTO trigger_reactions (user_trigger_id, reaction_id, trigger_reaction_name)
        VALUES ('${checkInputBeforeSqlQuery(user_trigger_id)}', '${checkInputBeforeSqlQuery(reacton_id)}',  '${checkInputBeforeSqlQuery(trigger_reaction_name)}')
        RETURNING trigger_reaction_id`)
        res.sendStatus(201)
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

export const addSongToQueue = async (row) => {
    try {
        var trigger_reaction_id = row.id
        var song_link = row.argument
        var user_id_res = await db_adm_conn.query(`
        SELECT u.user_id
        FROM users u
        JOIN user_trigger ut ON ut.user_id = u.user_id
        JOIN trigger_reactions tr ON tr.user_trigger_id = ut.user_trigger_id 
        WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)
        var client = await getClient(user_id_res.rows[0].user_id)
        try {
            var prefix = "https://open.spotify.com/track/"
            var end = song_link.indexOf('?')
            var track_uri
            if (end != -1)
                track_uri = "spotify:track:" + song_link.substring(song_link.indexOf(prefix) + prefix.length, end)
            else
                track_uri = "spotify:track:" + song_link.substring(song_link.indexOf(prefix) + prefix.length)
            await client.addToQueue([track_uri])
        } catch(err){
            console.log(err)
        }
    } catch (err) {
        console.log(err.stack)
    }
}