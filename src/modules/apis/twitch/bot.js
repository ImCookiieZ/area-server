import Axios from 'axios';
import tmi from 'tmi.js';
import db_adm_conn from '../../db/index.js';
import { get_access_token } from '../../db/tokens.js';
import { checkInputBeforeSqlQuery } from '../../Helper.js';
import { handleReactions } from '../../reactions/checkForReaction.js';
export var client;
import { client_secret, client_id } from './tokens.js'

export const checkIfTwitchChannelExists = async (channelname, user_id) => {
    try {
        var authOptions = {
            url: 'https://api.twitch.tv/helix/users?login=' + channelname, 
            headers: {
                'Authorization': 'Bearer ' +  await get_access_token('twitch', user_id),
                'client-id': client_id
            },
            json: true
        };

        var result = await Axios.get("https://api.twitch.tv/helix/users?login=" + channelname, {headers: authOptions.headers})
        if (result.data.data != 0)
            return true
        console.log(result.data)
        return false
    } catch(err) {
        console.log(err.stack)
        return false
    }
}

export const reloadTwitchClient = async () => {
    try {
        var db_res = await db_adm_conn.query(`
        SELECT DISTINCT ta.argument_value
            FROM trigger_arguments ta
            JOIN user_trigger ut ON ut.user_trigger_id = ta.user_trigger_id
            JOIN triggers t ON t.trigger_id = ut.trigger_id
            WHERE ta.argument_name = 'channel_name' AND t.trigger_name = 'channel-command'`)
        var channels = []
        for (var i = 0; i < db_res.rows.length; i++) {
            channels.push(db_res.rows[i].argument_value)
        }
        client = new tmi.Client({
            options: { debug: true },
            identity: {
                username: 'Epitech-dashboard',
                password: 'oauth:8lee5wpwewmizkfcstbdk04t25tryy'
            },
            channels: channels
        });
        client.connect().catch(console.error);
    } catch(err) {
        console.log('twitch error')
        console.log(err.stack)
    }
}

await reloadTwitchClient()

client.on('message', async (channel, tags, message, self) => {
    try {
        if (self) return;
        if (!message.startsWith('!'))
            return;
        var command
        if (message.indexOf(' ') != -1)
            command = message.substring(1, message.indexOf(' '))
        else
            command = message.substring(1)
        console.log(channel)
        var commands_res = await db_adm_conn.query(`
        SELECT tr.trigger_reaction_id as id, r.reaction_name as type, argument_value as commandname
        FROM trigger_reactions tr
        JOIN reactions r ON tr.reaction_id = r.reaction_id
        JOIN user_trigger ut ON tr.user_trigger_id = ut.user_trigger_id
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        WHERE ut.user_trigger_id in (
            SELECT user_trigger_id
            FROM trigger_arguments
            WHERE argument_name = 'command_name' AND argument_value = '${checkInputBeforeSqlQuery(command)}'
                AND user_trigger_id in (
                    SELECT user_trigger_id
                    FROM trigger_arguments
                    WHERE argument_name = 'channel_name' AND argument_value = '${checkInputBeforeSqlQuery(channel)}'
                    ORDER BY user_trigger_id)
            ORDER BY user_trigger_id)
            AND argument_name = 'command_name'
        `)
        // console.log(commands_res.rows)
        var items = []
        var items = []
        for (var row of commands_res.rows) {
            items.push({id: row.id, type: row.type, commandname: row.commandname, argument: message.substring(message.indexOf(' ') + 1)})
        }
        if (handleReactions(items))
            client.say(channel, "command executed <3")
        // for (var j = 0; j < channel_commands.rows.length; j++) {
        //     if (message.startsWith('!' + channel_commands.rows[j].argument_value)) {
        //         executeCommand()
        //         // console.log(`Command ${channel_commands.rows[j].argument_value} was used :)`)
        //     }
    // }
    } catch(err) {
        console.log(err)
    }
});
