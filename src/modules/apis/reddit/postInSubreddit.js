import { checkInputBeforeSqlQuery } from '../../Helper.js'
import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { getClient, getTriggerInfo } from './helper.js'

const getPostsSinceLastTimeChecked = async (client, subreddit_name, latest_time) => {
    if (subreddit_name === 'undefined')
        return
    if (!client)
        return
    var posts = await client.getSubreddit(subreddit_name).getNew()

    let new_posts = []

    for (let i = 0; i < posts.length; ++i) {
        const post = posts[i];
        const post_time = post["created"]

        //console.log(`\n\nLast post  [${post_time}]\nLast check [${latest_time}]\nDiff:      [${latest_time - post_time}]`)

        if (post_time > latest_time) {
            console.log(`NEW POST on ${subreddit_name} [${post["title"]} from ${post["author"]["name"]}]`)
            new_posts.push(post)
        } else {
            break
        }
    }

    return new_posts;
}


const checkForNewPostsInSubreddit = async (subreddit_name, user_id, lastchecked) => {
    if (!subreddit_name) {
        return []
    }
    var client = await getClient(user_id)
    const lastPost = await getPostsSinceLastTimeChecked(client, subreddit_name, lastchecked);
    return lastPost;
}


export const checkPostOnSubredditTrigger = async () => {
    var res = await getTriggerInfo('post-subreddit')
    let triggers = [];

    for (let i = 0; i < res.rows.length; i += 2) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];

        if (cur.argument_name == "subreddit_name") {
            triggers.push({
                lastchecked: next.argument_value,
                subreddit_name: cur.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        } else {
            triggers.push({
                lastchecked: cur.argument_value,
                subreddit_name: next.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        }
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        await checkForNewPostsInSubreddit(triggers[i].subreddit_name, triggers[i].user_id, triggers[i].lastchecked)
    }

    var current_time = Math.floor((new Date().getTime() - 2) / 1000); //seconds since epoch
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
    await db_adm_conn.query(quer)
}


export const createLastPostOnSubreddit = async(req, res) => {
    const userid = req.user.userid
    const subreddit_name = req.body.subreddit
    const trigger_id = await getTriggerId('post-subreddit')

    const r = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
            FROM user_trigger ut
                JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
                JOIN triggers t ON t.trigger_id = ut.trigger_id
            WHERE t.trigger_name = 'post-subreddit' AND
                  ta.argument_value = '${subreddit_name}'
            ORDER BY ta.user_trigger_id
    `)

    if (r.rows.length != 0) {
        res.status(202).send({ user_trigger_id: r.rows[0].user_trigger_id })
        return
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
    VALUES
        ('${user_trigger_id}', 'lastchecked', '${current_time}'),
        ('${user_trigger_id}', 'subreddit_name', '${checkInputBeforeSqlQuery(subreddit_name)}')`
    await db_adm_conn.query(querystr);
    res.status(201).send({ user_trigger_id: user_trigger_id })
}
