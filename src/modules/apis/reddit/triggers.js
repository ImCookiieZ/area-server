import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { getClient, getTriggerInfo } from './helper.js'
import { handleReactions } from '../../reactions/checkForReaction.js'

const checkForNewPostInFeed = async (user_id, latest_time, user_trigger_id) => {
    const client = await getClient(user_id);

    if (!client)
        return null

    var posts = await client.getNew()

    let new_posts = []

    var commands_res = await db_adm_conn.query(`
        SELECT tr.trigger_reaction_id as id, r.reaction_name as type
        FROM trigger_reactions tr
        JOIN reactions r ON tr.reaction_id = r.reaction_id
        JOIN user_trigger ut ON tr.user_trigger_id = ut.user_trigger_id
        JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
        WHERE ut.user_trigger_id = '${user_trigger_id}' 
    `)

    for (let i = 0; i < posts.length; ++i) {
        const post = posts[i];
        const post_id = post["id"]
        const post_time = post["created"]

        if (post_time > latest_time) {
            new_posts.push({
                id: commands_res.rows[0].id,
                type: commands_res.rows[0].type,
                message: `NEW POST on feed: [${post["title"]} from ${post["author"]["name"]}]`,
                argument: post_id
            })
        } else {
            break
        }
    }

    handleReactions(new_posts)

    return new_posts;
}

export const checkPostOnFeedTrigger = async () => {
    try {
    var res = await getTriggerInfo('post-feed')
    let triggers = [];

    for (let i = 0; i < res.rows.length; ++i) {
        const cur = res.rows[i];
        triggers.push({
            lastchecked: cur.argument_value,
            user_trigger_id: cur.user_trigger_id,
            user_id: cur.user_id
        })
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        try {
        const ret = await checkForNewPostInFeed(triggers[i].user_id, triggers[i].lastchecked, triggers[i].user_trigger_id)
        if (!ret)
            return null
            }    catch {}
    }

    var current_time = Math.floor((new Date().getTime() - 2) / 1000);
    var quer = `
    UPDATE trigger_arguments
    SET argument_value = '${current_time}'
    WHERE argument_name = 'lastchecked' AND user_trigger_id IN (`
    for (var i = 0; i < triggers.length; i++) {
        quer += `'${triggers[i].user_trigger_id}'`
        if (i < triggers.length - 1)
            quer += `, `
    }
    quer += `)`
    return await db_adm_conn.query(quer)
    } catch {}
}

export const createLastPostOnFeed = async (req, res) => {
    const userid = req.user.userid
    const trigger_id = await getTriggerId('post-feed')
    const info = await getTriggerInfo('post-feed')

    if (info.rows.length != 0) {
        const ut_id = info.rows[0].user_trigger_id
        res.status(202).send({ user_trigger_id: ut_id })
        return;
    }

    var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO
            user_trigger(user_id, trigger_id)
            VALUES ('${userid}', '${trigger_id}')
        RETURNING user_trigger_id
    `);

    var user_trigger_id = user_trigger_id_res.rows[0].user_trigger_id
    var current_time = Math.floor((new Date().getTime() - 2) / 1000); //seconds since epoch
    var querystr = `
    INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
    VALUES ('${user_trigger_id}', 'lastchecked', '${current_time}')`

    await db_adm_conn.query(querystr);
    res.status(201).send({ user_trigger_id: user_trigger_id })
}