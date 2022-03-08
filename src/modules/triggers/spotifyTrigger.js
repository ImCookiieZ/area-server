import db_adm_conn from "../db/index.js"
import { checkForNewSongsInPlaylist } from "../apis/spotify/triggers.js"

export const checkPlaylistTrigger = async () => {
    try {
    var db_res = await db_adm_conn.query(`
    SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
    FROM user_trigger ut
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        JOIN triggers t ON t.trigger_id = ut.trigger_id
    WHERE t.trigger_name = 'song-playlist'
    ORDER BY ta.user_trigger_id`)

    var triggers = []
    for (var i = 0; i < db_res.rows.length; i += 2) {
        if (db_res.rows[i].argument_name == "lastchecked") {
            triggers.push({
                lastchecked: db_res.rows[i].argument_value,
                playlistid: db_res.rows[i + 1].argument_value,
                user_trigger_id: db_res.rows[i].user_trigger_id,
                user_id: db_res.rows[i].user_id,
            })
        }
        else {
            triggers.push({
                lastchecked: db_res.rows[i + 1].argument_value,
                playlistid: db_res.rows[i].argument_value,
                user_trigger_id: db_res.rows[i].user_trigger_id,
                user_id: db_res.rows[i].user_id,
            })
        }
    }
    if (triggers.length == 0)
        return
    // AND
    //     user_trigger_id IN (
    //         SELECT ut.user_trigger_id
    //         FROM user_trigger ut
    //         JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
    //         JOIN triggers t ON t.trigger_id = ut.trigger_id
    //         WHERE t.trigger_name = 'song-playlist'
    //             AND ta.argument_name = 'lastchecked'
    //             AND CAST(ta.argument_value as float) < 1643019560
    //         ORDER BY ut.user_trigger_id)`)
    for (var i = 0; i < triggers.length; i++) {
        await checkForNewSongsInPlaylist(triggers[i])
    }
    var quer = `
    UPDATE trigger_arguments
    SET argument_value = '${((new Date()).getTime() - 2) / 1000}'
    WHERE argument_name = 'lastchecked' AND user_trigger_id IN (`
    for (var i = 0; i < triggers.length; i++) {
        quer += `'${triggers[i].user_trigger_id}'`
        if (i < triggers.length - 1)
            quer += `, `
    }
    quer += `)`
    var db_update = await db_adm_conn.query(quer)
}catch {}
}


// export const checkQueueTrigger = async () => {
//     var db_res = await db_adm_conn.query(`
//     SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
//     FROM user_trigger ut
//         JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
//         JOIN triggers t ON t.trigger_id = ut.trigger_id
//     WHERE t.trigger_name = 'song-playlist'
//     ORDER BY ta.user_trigger_id`)

//     var triggers = []
//     for (var i = 0; i < db_res.rows.length; i += 1) {
//         triggers.push({
//             lastchecked: db_res.rows[i].argument_value,
//             user_trigger_id: db_res.rows[i].user_trigger_id,
//             user_id: db_res.rows[i].user_id,
//         })
//     }
//     if (triggers.length == 0)
//         return
//     // AND
//     //     user_trigger_id IN (
//     //         SELECT ut.user_trigger_id
//     //         FROM user_trigger ut
//     //         JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
//     //         JOIN triggers t ON t.trigger_id = ut.trigger_id
//     //         WHERE t.trigger_name = 'song-playlist'
//     //             AND ta.argument_name = 'lastchecked'
//     //             AND CAST(ta.argument_value as float) < 1643019560
//     //         ORDER BY ut.user_trigger_id)`)
//     for (var i = 0; i < triggers.length; i++) {
//         await checkForNewSongsInQueue(triggers[i])
//     }
//     var quer = `
//     UPDATE trigger_arguments
//     SET argument_value = '${((new Date()).getTime() - 2) / 1000}'
//     WHERE argument_name = 'lastchecked' AND user_trigger_id IN (`
//     for (var i = 0; i < triggers.length; i++) {
//         quer += `'${triggers[i].user_trigger_id}'`
//         if (i < triggers.length - 1)
//             quer += `, `
//     }
//     quer += `)`
//     var db_update = await db_adm_conn.query(quer)
// }