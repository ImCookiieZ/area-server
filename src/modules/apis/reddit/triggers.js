import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { getClient, getTriggerInfo } from './helper.js'

const checkForNewPostInFeed = async (user_id, latest_time) => {
    const client = await getClient(user_id);

    if (!client)
        return null

    var posts = await client.getNew()

    let new_posts = []

    for (let i = 0; i < posts.length; ++i) {
        const post = posts[i];
        const post_time = post["created"]

        if (post_time > latest_time) {
            //console.log(`NEW POST on feed [${post["title"]} from ${post["author"]["name"]}]`)
            new_posts.push(post)
        } else {
            break
        }
    }

    return new_posts;
}

export const checkPostOnFeedTrigger = async () => {
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
        const ret = await checkForNewPostInFeed(triggers[i].user_id, triggers[i].lastchecked)
        if (!ret)
            return null
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