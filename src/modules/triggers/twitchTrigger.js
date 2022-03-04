import request from 'request';
import querystring from 'querystring';
import { get_access_token } from '../../modules/db/tokens.js';
import db_adm_conn from '../db/index.js';
import { client_id } from '../apis/twitch/tokens.js';
export const checkLiveTrigger = async () => {
    var db_res = await db_adm_conn.query(`
    SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
    FROM user_trigger ut
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        JOIN triggers t ON t.trigger_id = ut.trigger_id
    WHERE t.trigger_name = 'channel-live'
    ORDER BY ta.user_trigger_id`)

    var triggers = []
    for (var i = 0; i < db_res.rows.length; i += 2) {
        if (db_res.rows[i].argument_name == "channel_name") {
            triggers.push({
                channel_name: db_res.rows[i].argument_value,
                live_state: db_res.rows[i + 1].argument_value,
                user_trigger_id: db_res.rows[i].user_trigger_id,
                user_id: db_res.rows[i].user_id
            })
        }
        else {
            triggers.push({
                channel_name: db_res.rows[i + 1].argument_value,
                live_state: db_res.rows[i].argument_value,
                user_trigger_id: db_res.rows[i].user_trigger_id,
                user_id: db_res.rows[i].user_id
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
        await getStreamGoesLive(triggers[i].channel_name, triggers[i].live_state, triggers[i].user_id, triggers[i].user_trigger_id)
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
}
export const setChannelLiveState = async (channel_name, live_state, channel_user_id) => {
    var qu = `
    UPDATE trigger_arguments
    SET argument_value = '${live_state}'
    WHERE argument_name = 'live_state' AND user_trigger_id = '${channel_user_id}'`
    await db_adm_conn.query(qu)
}

export const getStreamGoesLive = async (channel_name, live_state, user_id, channel_user_id) => {
    var twitch_token = await get_access_token('twitch', user_id)
    var authOptions = {
        url: 'https://api.twitch.tv/helix/streams?user_login=' + channel_name,
        // url: 'https://api.twitch.tv/kraken/streams/' + channel_name,
        headers: {
            'Authorization': `Bearer ${twitch_token}`,
            'Client-ID': client_id
            // 'Accept': 'application/vnd.twitchtv.v5+json'
        },
        json: true
    };
    request.get(authOptions, async (err, response, body) => {
        if (!err && response.statusCode === 200) {
            if (body.data.length > 0) {
                if (body.data[0].type == "live" && live_state == 'offline') {
                    await setChannelLiveState(channel_name, 'online', channel_user_id)
                    console.log(channel_name + ' is going live!')
                }
            } else {
                if (live_state == 'online') {
                    await setChannelLiveState(channel_name, 'offline', channel_user_id)
                    console.log(channel_name + " went offline!")
                }
            }
        } else {
            console.log(body)
        }
    })
}