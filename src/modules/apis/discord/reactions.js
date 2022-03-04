import db_adm_conn from '../../db/index.js'
import { getReactionId } from '../../db/reaction.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from "../../Helper.js"
import { client } from './bot.js'

export const createDiscordMessage = async (req, res) => {
    try {
        const channel_id = req.body.channel_id
        const trigger_reaction_name = req.body.trigger_reaction_name
        const message_string = req.body.message
        const user_trigger_id = req.body.user_trigger_id

        const reacton_id = await getReactionId('server-message')
        if (!client.channels.cache.filter((ch) => ch.type === 'GUILD_TEXT').map(chan => chan.id).includes(channel_id)) {
            res.status(400).send(createErrorMessage('Bot not on a server with the channel id. Reconnect discord to your account and add the bot to right server'))
            return
        }

        var trigger_reaction_id_res = await db_adm_conn.query(`
        INSERT INTO trigger_reactions (user_trigger_id, reaction_id, trigger_reaction_name)
        VALUES ('${checkInputBeforeSqlQuery(user_trigger_id)}', '${checkInputBeforeSqlQuery(reacton_id)}',  '${checkInputBeforeSqlQuery(trigger_reaction_name)}')
        RETURNING trigger_reaction_id`)
        var trigger_reaction_id = trigger_reaction_id_res.rows[0].trigger_reaction_id
        var arguments_res = await db_adm_conn.query(`
        INSERT INTO reaction_arguments (argument_name, argument_value, trigger_reaction_id)
        VALUES ('channel_id', '${checkInputBeforeSqlQuery(channel_id)}', '${checkInputBeforeSqlQuery(trigger_reaction_id)}'),
            ('message_string', '${checkInputBeforeSqlQuery(message_string)}', '${checkInputBeforeSqlQuery(trigger_reaction_id)}')`)
        res.sendStatus(201)
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

export const sendMessage = async (row) => {
    try {
        var trigger_reaction_id = row.id
        var message = row.message
        var channel_id
        var message_string
        var argument_res = await db_adm_conn.query(`
        SELECT ra.argument_name, ra.argument_value
        FROM reaction_arguments ra
        WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)
        if (argument_res.rows[0].argument_name == 'channel_id') {
            channel_id = argument_res.rows[0].argument_value
            message_string = argument_res.rows[1].argument_value
        } else {
            channel_id = argument_res.rows[1].argument_value
            message_string = argument_res.rows[0].argument_value
        }
        var dc_channel = client.channels.cache.find(channel => channel.id === channel_id)
        if (dc_channel) {
            if (message && message_string == "[default]")
                dc_channel.send(message)
            else
                dc_channel.send(message_string)
        }
    } catch (err) {
        console.log(err.stack)
    }
}