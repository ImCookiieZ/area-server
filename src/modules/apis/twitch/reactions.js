import db_adm_conn from '../../db/index.js'
import { getReactionId } from '../../db/reaction.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from "../../Helper.js"
import { client, checkIfTwitchChannelExists } from './bot.js'
export const createChannelMessage = async (req, res) => {
    try {
    // const songlink = req.body.songlink
        const channel_name = req.body.channel_name
        const trigger_reaction_name = req.body.trigger_reaction_name
        const user_trigger_id = req.body.user_trigger_id
        const message_string = req.body.message

        if (!await checkIfTwitchChannelExists(channel_name, req.user.userid)) {
            res.status(400).send(createErrorMessage('Channel does not exist on twitch'))
            return
        }
        const reacton_id = await getReactionId('channel-message')
        var trigger_reaction_id_res = await db_adm_conn.query(`
        INSERT INTO trigger_reactions (user_trigger_id, reaction_id, trigger_reaction_name)
        VALUES ('${checkInputBeforeSqlQuery(user_trigger_id)}', '${checkInputBeforeSqlQuery(reacton_id)}',  '${checkInputBeforeSqlQuery(trigger_reaction_name)}')
        RETURNING trigger_reaction_id`)
        var trigger_reaction_id = trigger_reaction_id_res.rows[0].trigger_reaction_id
        var arguments_res = await db_adm_conn.query(`
        INSERT INTO reaction_arguments (argument_name, argument_value, trigger_reaction_id)
        VALUES ('channelname', '${checkInputBeforeSqlQuery(channel_name)}', '${checkInputBeforeSqlQuery(trigger_reaction_id)}'),
            ('message', '${checkInputBeforeSqlQuery(message_string)}', '${checkInputBeforeSqlQuery(trigger_reaction_id)}')`)
        res.sendStatus(201)
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

export const sendMessage = async (row) => {
    var trigger_reaction_id = row.id
    var message = row.message
    var channel
    var message_string
    var argument_res = await db_adm_conn.query(`
    SELECT ra.argument_name, ra.argument_value
    FROM reaction_arguments ra
    WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)
    if (argument_res.rows[0].argument_name == 'channelname') {
        channel = argument_res.rows[0].argument_value
        message_string = argument_res.rows[1].argument_value
    } else {
        channel = argument_res.rows[1].argument_value
        message_string = argument_res.rows[0].argument_value
    }
    if (message && (message_string == "[default]" || message_string.length == 0))
        client.say(channel, message)
    else
        client.say(channel, message_string)
}