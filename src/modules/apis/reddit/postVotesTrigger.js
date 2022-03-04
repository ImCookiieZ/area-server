import { checkInputBeforeSqlQuery } from '../../Helper.js'
import db_adm_conn from '../../db/index.js'
import { getTriggerId } from '../../db/trigger.js'
import { getClient, getTriggerInfo } from './helper.js'
import { createErrorMessage } from '../../Helper.js';

const checkUpvotes = async (upvotes, user_id, post_id) => {
    if (!post_id)
        return
    var client = await getClient(user_id)
    if (!client)
        return

    const sbm = await client.getSubmission(post_id)
    const current_upvotes = await sbm.score

    if (current_upvotes > upvotes) {
        console.log(`Post [${post_id}] has increased upvotes from ${upvotes} to ${current_upvotes}`)
    }
    return current_upvotes
}


export const checkPostUpvote = async () => {
    var res = await getTriggerInfo('post-upvote')
    let triggers = [];

    for (let i = 0; i < res.rows.length; i += 2) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];

        if (cur.argument_name == "post_id") {
            triggers.push({
                upvote: next.argument_value,
                post_id: cur.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        } else {
            triggers.push({
                upvote: cur.argument_value,
                post_id: next.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        }
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        const current_upvotes = await checkUpvotes(triggers[i].upvote, triggers[i].user_id, triggers[i].post_id)
        await db_adm_conn.query(`
            UPDATE trigger_arguments
            SET argument_value = ${current_upvotes}
            WHERE argument_name = 'upvote' AND user_trigger_id = '${triggers[i].user_trigger_id}'
        `)
    }
}

const createPostVote = async (req, res, kind) => {
    const userid = req.user.userid
    const post_id = req.body.post_id
    const trigger_id = await getTriggerId(`post-${kind}`)

    const r = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
            FROM user_trigger ut
                JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
                JOIN triggers t ON t.trigger_id = ut.trigger_id
            WHERE t.trigger_name = 'post-${kind}' AND
                  ta.argument_value = '${post_id}'
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

    const client = await getClient(userid)

    if (!client) {
        res.status(401).send(createErrorMessage(`${user_trigger_id}: ${user_trigger_id}`))
        return
    }

    const sbm = await client.getSubmission(post_id)
    const current_upvotes = await sbm.score

    var querystr = `
    INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
    VALUES
        ('${user_trigger_id}', '${kind}', '${current_upvotes}'),
        ('${user_trigger_id}', 'post_id', '${checkInputBeforeSqlQuery(post_id)}')`
    await db_adm_conn.query(querystr);
    res.status(201).send({ user_trigger_id: user_trigger_id })
}

export const createPostUpvote = async (req, res) => {
    createPostVote(req, res, "upvote");
}

const checkEachVoteChange = async (last_votes, user_id, post_id) => {
    if (!post_id)
        return

    var client = await getClient(user_id)
    if (!client)
        return

    const sbm = await client.getSubmission(post_id)
    const current_upvotes = await sbm.score

    if (current_upvotes != last_votes) {
        console.log(`Post [${post_id}] has changed the upvotes from ${last_votes} to ${current_upvotes}`)
    } else {
        console.log(`Post [${post_id}] has not changed the upvotes and remains at ${current_upvotes}`)
    }

    return current_upvotes;
}

export const checkPostVoteChange = async () => {
    var res = await getTriggerInfo('post-vote')
    let triggers = []

    for (let i = 0; i < res.rows.length; i += 2) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];

        if (cur.argument_name == "post_id") {
            triggers.push({
                last_votes: next.argument_value,
                post_id: cur.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        } else {
            triggers.push({
                last_votes: cur.argument_value,
                post_id: next.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        }
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        const current_upvotes = await checkEachVoteChange(triggers[i].last_votes, triggers[i].user_id, triggers[i].post_id)
        await db_adm_conn.query(`
            UPDATE trigger_arguments
            SET argument_value = ${current_upvotes}
            WHERE argument_name = 'vote' AND user_trigger_id = '${triggers[i].user_trigger_id}'
        `)
    }
}

export const createPostVoteChanged = async (req, res) => {
    createPostVote(req, res, "vote");
}


const checkDownvotes = async (upvotes, user_id, post_id) => {
    if (!post_id) {
        return
    }
    var client = await getClient(user_id)
    if (!client) {
        return
    }

    const sbm = await client.getSubmission(post_id)
    const current_upvotes = await sbm.score

    if (current_upvotes < upvotes) {
        console.log(`Post [${post_id}] has decreased upvotes from ${upvotes} to ${current_upvotes}`)
    }
    return current_upvotes
}

export const checkPostDownvote = async () => {
    var res = await getTriggerInfo('post-downvote')
    let triggers = [];

    for (let i = 0; i < res.rows.length; i += 2) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];

        if (cur.argument_name == "post_id") {
            triggers.push({
                downvote: next.argument_value,
                post_id: cur.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        } else {
            triggers.push({
                downvote: cur.argument_value,
                post_id: next.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        }
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        const current_upvotes = await checkDownvotes(triggers[i].downvote, triggers[i].user_id, triggers[i].post_id)
        await db_adm_conn.query(`
            UPDATE trigger_arguments
            SET argument_value = ${current_upvotes}
            WHERE argument_name = 'downvote' AND user_trigger_id = '${triggers[i].user_trigger_id}'
        `)
    }
}


export const createPostDownvote = async (req, res) => {
    createPostVote(req, res, "downvote");
}

export const checkVotelimit = async (votelimit, user_id, post_id) => {
    if (!post_id)
        return
    var client = await getClient(user_id)
    if (!client)
        return

    const sbm = await client.getSubmission(post_id)
    const current_upvotes = await sbm.score

    if (current_upvotes >= votelimit) {
        console.log(`Post [${post_id}] has reached the upvotelimit of ${votelimit}`)
    } else {
        console.log(`Post [${post_id}] has NOT reached the upvotelimit of ${votelimit} with their ${current_upvotes} upvotes`)
    }
}

export const checkPostVotelimit = async () => {
    var res = await getTriggerInfo('post-votelimit')
    let triggers = [];

    for (let i = 0; i < res.rows.length; i += 2) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];

        if (cur.argument_name == "post_id") {
            triggers.push({
                votelimit: next.argument_value,
                post_id: cur.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        } else {
            triggers.push({
                votelimit: cur.argument_value,
                post_id: next.argument_value,
                user_trigger_id: cur.user_trigger_id,
                user_id: cur.user_id
            })
        }
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        await checkVotelimit(triggers[i].votelimit, triggers[i].user_id, triggers[i].post_id)
    }
}

export const createPostVotelimit = async (req, res) => {
    const userid = req.user.userid
    const post_id = req.body.post_id
    const votelimit = req.body.votelimit
    const trigger_id = await getTriggerId(`post-votelimit`)

    const r = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
            FROM user_trigger ut
                JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
                JOIN triggers t ON t.trigger_id = ut.trigger_id
            WHERE t.trigger_name = 'post-votelimit' AND
                  ta.argument_value = '${post_id}'
            ORDER BY ta.user_trigger_id
    `) //@todo make it possible to set a trigger on the same post but with a different votelimit

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

    const client = await getClient(userid)

    if (!client) {
        res.status(401).send(createErrorMessage(`${user_trigger_id}: ${user_trigger_id}`))
        return
    }

    var querystr = `
    INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
    VALUES
        ('${user_trigger_id}', 'votelimit', '${votelimit}'),
        ('${user_trigger_id}', 'post_id', '${checkInputBeforeSqlQuery(post_id)}')`
    await db_adm_conn.query(querystr);
    res.status(201).send({ user_trigger_id: user_trigger_id })
}
