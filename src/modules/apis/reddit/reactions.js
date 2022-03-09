import db_adm_conn from '../../db/index.js'
import { getReactionId } from '../../db/reaction.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from "../../Helper.js"
import { getClient } from './helper.js'

export const createRedditUpvote = async(req, res) => {
    try {
        const postid = req.body.post_id;
        const trigger_reaction_name = req.body.trigger_reaction_name;
        const user_trigger_id = req.body.user_trigger_id;

        //@todo add errorhandling here

        const reaction_id = await getReactionId('vote');

        var trigger_reaction_id_res = await db_adm_conn.query(`
            INSERT INTO trigger_reactions (user_trigger_id, reaction_id, trigger_reaction_name)
            VALUES (
                '${checkInputBeforeSqlQuery(user_trigger_id)}',
                '${checkInputBeforeSqlQuery(reaction_id)}',
                '${checkInputBeforeSqlQuery(trigger_reaction_name)}')
            RETURNING trigger_reaction_id`);

        var trigger_reaction_id = trigger_reaction_id_res.rows[0].trigger_reaction_id;

        var argument_res = await db_adm_conn.query(`
            INSERT INTO reaction_arguments (argument_name, argument_value, trigger_reaction_id)
            VALUES ('post_id', '${checkInputBeforeSqlQuery(postid)}', '${checkInputBeforeSqlQuery(trigger_reaction_id)}')`)
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(createErrorMessage(err.stack))
    }
}

export const upvoteRedditPost = async(row) => {
    var trigger_reaction_id = row.id;
    var postid = row.argument;

    console.log("BEFORE: " + postid);

    var user_id_res = await db_adm_conn.query(`
        SELECT u.user_id
        FROM users u
        JOIN user_trigger ut ON ut.user_id = u.user_id
        JOIN trigger_reactions tr ON tr.user_trigger_id = ut.user_trigger_id 
        WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)

    var userid = user_id_res.rows[0].user_id;

    const client = await getClient(userid);

    var argument_res = await db_adm_conn.query(`
        SELECT ra.argument_name, ra.argument_value
        FROM reaction_arguments ra
        WHERE trigger_reaction_id = '${checkInputBeforeSqlQuery(trigger_reaction_id)}'`)

    if (argument_res.rows[0].argument_name == 'post_id') {
        postid = argument_res.rows[0].argument_value
    } else {
        postid = argument_res.rows[1].argument_value
    }
    console.log("AFTER: " + postid);
    if (!client) {
        console.log("Could not get Reddit client");
    }

    try {
        client.getSubmission(postid).upvote();
    } catch (err) {
        console.log(err.stack);
    }

    console.log(`Upvoted post [${postid}].`);
}
