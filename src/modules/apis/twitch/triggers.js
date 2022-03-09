import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { createErrorMessage } from '../../Helper.js'
import { reloadTwitchClient, checkIfTwitchChannelExists } from './bot.js'
export const createChannelLive = async (req, res) => {
    var channel_name = req.body.channel_name
    var trigger_id = await getTriggerId("channel-live");
    if (await checkIfTwitchChannelExists(channel_name, req.user.userid) == false) {
        console.log('err')
        res.status(400).send(createErrorMessage('Channel does not exist on twitch'))
        return
    }
    console.log('no err')
    var user_trigger_id_res = await db_adm_conn.query(`
    INSERT INTO user_trigger(user_id, trigger_id)
    VALUES ('${req.user.userid}', '${trigger_id}')
    RETURNING user_trigger_id`);

    await db_adm_conn.query(`
    INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
    VALUES
    ('${user_trigger_id_res.rows[0].user_trigger_id}', 'channel_name', '#${channel_name}'),
    ('${user_trigger_id_res.rows[0].user_trigger_id}', 'live_state', 'offline')`)
    res.status(202).send({ user_trigger_id: user_trigger_id_res.rows[0].user_trigger_id })
}


export const createChannelCommand = async (req, res) => {
    try {
        // var arguments = req.body.trigger_arguments
        var commandname = req.body.commandname
        var channel_name = req.body.channel_name
        if (await checkIfTwitchChannelExists(channel_name, req.user.userid) == false) {
            res.status(400).send(createErrorMessage('Channel does not exist on twitch'))
            return
        }
        var trigger_id = await getTriggerId("channel-command");

        var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO user_trigger(user_id, trigger_id)
        VALUES ('${req.user.userid}', '${trigger_id}')
        RETURNING user_trigger_id`);

        await db_adm_conn.query(`
        INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
        VALUES
            ('${user_trigger_id_res.rows[0].user_trigger_id}', 'channel_name', '#${channel_name}'), 
            ('${user_trigger_id_res.rows[0].user_trigger_id}', 'command_name', '${commandname}')`)
        await reloadTwitchClient()
        res.status(202).send({ user_trigger_id: user_trigger_id_res.rows[0].user_trigger_id })
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

// export const createTrigger = async (req, res) => {
//     var args = req.body.trigger_arguments
//     var name = req.body.trigger_name

//     if (name == "server-command")
//         createDiscordCommand(req, res);
// }