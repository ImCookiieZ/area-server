import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { client_id } from './tokens.js'
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { createErrorMessage } from '../../Helper.js';
import { client } from './bot.js';
const rest = new REST({ version: '9' }).setToken((await db_adm_conn.query(`SELECT additional_token as token FROM services WHERE service_name = 'discord'`)).rows[0].token);

export const createDiscordJoin = async (req, res) => {
    try{
        var serverid = req.body.server_id
        var trigger_id = await getTriggerId("server-join");
        const Guilds = client.guilds.cache.map(guild => guild.id);
        if (!Guilds.includes(serverid)) {
            res.status(400).send(createErrorMessage('Bot not on the server. Reconnect discord to your account and add the bot to given server'))
            return
        }
        var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO user_trigger(user_id, trigger_id)
        VALUES ('${req.user.userid}', '${trigger_id}')
        RETURNING user_trigger_id`);

        await db_adm_conn.query(`
        INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
        VALUES
            ('${user_trigger_id_res.rows[0].user_trigger_id}', 'server_id', '${serverid}')`)
        res.status(201).send({ user_trigger_id: user_trigger_id_res.rows[0].user_trigger_id })
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}


export const createDiscordCommand = async (req, res) => {
    try {
    // var arguments = req.body.trigger_arguments
        var commandname = req.body.commandname
        var serverid = req.body.server_id
        var trigger_id = await getTriggerId("server-command");
        const Guilds = client.guilds.cache.map(guild => guild.id);
        if (!Guilds.includes(serverid)) {
            res.status(400).send(createErrorMessage('Bot not on the server. Reconnect discord to your account and add the bot to given server'))
            return
        }
        if (!(/^[a-z]+$/.test(commandname))) {
            res.status(400).send(createErrorMessage("Commandname has to be only lowercase letters!"))
            return
        }
        var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO user_trigger(user_id, trigger_id)
        VALUES ('${req.user.userid}', '${trigger_id}')
        RETURNING user_trigger_id`);

        await db_adm_conn.query(`
        INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
        VALUES
            ('${user_trigger_id_res.rows[0].user_trigger_id}', 'server_id', '${serverid}'), 
            ('${user_trigger_id_res.rows[0].user_trigger_id}', 'commandname', '${commandname}')`)

        // await updateCommandsForServer(serverid);
        res.status(201).send({ user_trigger_id: user_trigger_id_res.rows[0].user_trigger_id })
    } catch(err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

const updateCommandsForServer = async (server_id) => {
    try {
        console.log('Started refreshing application (/) commands.');

        var commands = await db_adm_conn.query(`
        SELECT DISTINCT argument_value as name, 'AREA Bot Command' as description
        FROM trigger_arguments
        WHERE argument_name = 'commandname' AND user_trigger_id IN (
            SELECT DISTINCT user_trigger_id
            FROM trigger_arguments
            WHERE argument_name = 'server_id' and argument_value = '${server_id}')`);
        console.log(commands.rows)
        await rest.put(
            Routes.applicationGuildCommands(client_id, server_id),
            { body: commands.rows },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (err) {
        console.log(err.stack)
    }
};

// export const createTrigger = async (req, res) => {
//     var args = req.body.trigger_arguments
//     var name = req.body.trigger_name

//     if (name == "server-command")
//         createDiscordCommand(req, res);
// }