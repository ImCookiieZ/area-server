import { Client, Intents } from 'discord.js';
import db_adm_conn from '../../db/index.js';
import { checkInputBeforeSqlQuery } from '../../Helper.js';
import { handleReactions } from '../../reactions/checkForReaction.js'
export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

export const checkForServer = () => {

}

export const checkForChannel = () => {

}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
});

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min; // You can remove the Math.floor if you don't want it to be an integer
}

client.on("guildMemberAdd", async (member) => {
    try {
        var guilds = await db_adm_conn.query(`
        SELECT tr.trigger_reaction_id as id, r.reaction_name as type
        FROM trigger_reactions tr
        JOIN reactions r ON tr.reaction_id = r.reaction_id
        JOIN user_trigger ut ON tr.user_trigger_id = ut.user_trigger_id
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        JOIN triggers t ON t.trigger_id = ut.trigger_id 
        WHERE argument_name = 'server_id' AND argument_value = '${checkInputBeforeSqlQuery(member.guild.id)}' AND t.trigger_name = 'server-join'`)
        // console.log(guilds.rows)
        // console.log(`New User "${member.user.username}" has joined "${member.guild.name}"`);
        // for (var i = 0; i < guilds.rows.length; i++) {
        //     if (member.guild.id == guilds.rows[i].argument_value)
        //         member.guild.channels.cache.find(c => c.name === "welcome").send(`"${member.user.username}" has joined this server`);
        // }
        var items = []
        for (var row of guilds.rows) {
            items.push({id: row.id, type: row.type, message: `${member.user.username} has joined ${member.guild.name} on discord`, argument: null})
        }
        handleReactions(items)
    } catch (err) {
        console.log(err.stack)
        return
    }
})

client.on('messageCreate', async message => {
    try {
        if (message.author.bot == true)
            return;
        if (!message.content.startsWith('!'))
            return;
        var command
        if (message.content.indexOf(' ') != -1)
            command = message.content.substring(1, message.content.indexOf(' '))
        else
            command = message.content.substring(1)
        var commands_res = await db_adm_conn.query(`
        SELECT tr.trigger_reaction_id as id, r.reaction_name as type, argument_value as commandname
        FROM trigger_reactions tr
        JOIN reactions r ON tr.reaction_id = r.reaction_id
        JOIN user_trigger ut ON tr.user_trigger_id = ut.user_trigger_id
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        WHERE ut.user_trigger_id in (
            SELECT user_trigger_id
            FROM trigger_arguments
            WHERE argument_name = 'commandname' AND argument_value = '${checkInputBeforeSqlQuery(command)}'
                AND user_trigger_id in (
                    SELECT user_trigger_id
                    FROM trigger_arguments
                    WHERE argument_name = 'server_id' AND argument_value = '${checkInputBeforeSqlQuery(message.guildId)}'
                    ORDER BY user_trigger_id)
            ORDER BY user_trigger_id)
            AND argument_name = 'commandname'
        `)
        var items = []
        for (var row of commands_res.rows) {
            items.push({id: row.id, type: row.type, commandname: row.commandname, argument: message.content.substring(message.content.indexOf(' ') + 1), message: "user send: " + message.content})
        }
        if (handleReactions(items))
            message.channel.send("command executed <3")
        // for (var row of commands_res.rows)
        // {
        //     if (message.content.startsWith('!' + row.commandname))
        //         handleReactions(row)
        // }


        // for (var reaction of commands_res.rows) {
        //     console.log(reaction)
        //     if (reaction.argument_value == interaction.commandName && reaction.reaction_name == 'server-message') {
        //         sendMessage(reaction.trigger_reaction_id)
        //     }
        // }

        // await interaction.reply('command executed :)')
    } catch (err) {
        console.log(err.stack)
    }
});
// client.on("messageCreate", function (message) {
//     console.log(`message is created -> ${message}`);
// });
// client.on("channelDelete", function (channel) {
//     console.log(`channelDelete: ${channel}`);
// });