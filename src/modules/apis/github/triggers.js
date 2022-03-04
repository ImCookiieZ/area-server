import db_adm_conn from '../../db/index.js'

import GitHub from "github-api"
import { get_access_token } from '../../db/tokens.js'
import { getTriggerId } from '../../db/trigger.js'

//https://not-an-aardvark.github.io/snoowrap/index.html

const checkEachGithubPush = async (info) => {
    const access_token = await get_access_token('github', info.user_id);
    if (access_token == null)
        return null;
    var gh = new GitHub({
        token: access_token
    });

    var fork = await gh.getRepo(info.github_username, info.github_repo_name);

    var commits = await fork.listCommits({}, () => {})

    //@todo both of them work, but how can we need to set the url correct and localhost is not allowed
    /* ---- const config = {
    "name": "web",
    "active": true,
    "events": [
        "commit"
    ],
    "config": {
        //"url": "http://39a40427.ngrok.io/api/webhooks/incoming/github",
        "url": "localhost:8080/welcome",
        "content_type": "json"
        }
    };

    var hookDef = {
        "name" : "web",
        "config" : {
            "user" : info.github_username,
            "secret" : access_token,
            "url" : "https://google.com",
            "content_type": "json"
        },
        "events" : ["push", "pull_request"],
        "active" : true
    }
    fork.createHook(hookDef)
        .then(function({data: hook}) {
            console.log("A travis hook has been created which will trigger a build on push and pull request events...");
            consle.log(hook)
        }); ---- */

    //console.log("---COMMIT", commits["data"][0], "================================", commits["data"][1])

    let ret = []

    commits = commits["data"]

    for (let i = 0; i < commits.length; i++) {
        const commit = commits[i]["commit"]
        const tm = commit["author"]["date"]
        const dateString = new Date((tm || "").replace(/-/g,"/").replace(/[TZ]/g," "));
        const secs = dateString.getTime() / 1000
        const name = commit["author"]["name"]
        const email = commit["author"]["email"]
        const msg = commit["message"]

        //console.log("msg:", msg, "at", tm, "\nsecs:", secs, "\nlast:", info.lastchecked, "\ndiff:", secs - info.lastchecked, "\n\n")
        if (secs + 3600 > info.lastchecked) {
            ret.push({
                committer_name: name,
                committer_email: email,
                timestamp: tm,
                commit_message: msg
            });
        } else {
            break;
        }
    }

    if (ret.length === 0) {
        console.log("There is no new commit");
    } else {
        ret.forEach((elem) => {
            console.log(`New commit\n  - from: ${elem.committer_name} (${elem.committer_email})\n  - at ${elem.timestamp}\n  - with msg: "${elem.commit_message}"`)
        });
    }

    return ret;
}

export const checkGithubPush = async () => {
    var res = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
            FROM user_trigger ut
                JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
                JOIN triggers t ON t.trigger_id = ut.trigger_id
            WHERE t.trigger_name = 'repo-push'
            ORDER BY ta.user_trigger_id, ta.argument_name
    `)
    let triggers = [];

    for (let i = 0; i < res.rows.length; i += 3) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];
        const nextnext = res.rows[i + 2];
        triggers.push({
            github_repo_name: cur.argument_value,
            github_username: next.argument_value,
            lastchecked: nextnext.argument_value,
            user_trigger_id: cur.user_trigger_id,
            user_id: cur.user_id
        })
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        console.log(`Github Push: Entry ${i}: repo[${triggers[i].github_repo_name}], name[${triggers[i].github_username}]`)
        const ret = await checkEachGithubPush(triggers[i])
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


export const createGithubPushTrigger = async (req, res) => {
    const userid = req.user.userid

    const github_repo_name = req.body.github_repo_name
    const github_username = req.body.github_username
    const trigger_id = await getTriggerId('repo-push')

    const info = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
        FROM user_trigger ut
            JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
            JOIN triggers t ON t.trigger_id = ut.trigger_id
        WHERE t.trigger_name = 'repo-push' and
        (ta.argument_name = 'github_repo_name' or ta.argument_name = 'github_username')
        ORDER BY ta.user_trigger_id
    `)

    for (let i = 0; i < info.rows.length; i += 2) {
        if (info.rows[i].user_id == userid) {
            if (info.rows[i].argument_name == "github_repo_name" && info.rows[i].argument_value == github_repo_name) { //@fixme maybe check the other way around aswell
                if (info.rows[i + 1].argument_value == github_username) {
                    res.status(202).send({ user_trigger_id: info.rows[i].user_trigger_id })
                    return;
                }
            }
        }
    }

    var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO
            user_trigger(user_id, trigger_id)
            VALUES ('${userid}', '${trigger_id}')
        RETURNING user_trigger_id
    `);

    var user_trigger_id = user_trigger_id_res.rows[0].user_trigger_id
    var current_time = Math.floor((new Date().getTime() - 2) / 1000);

    var querystr = `
        INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
        VALUES
            ('${user_trigger_id}', 'github_repo_name', '${github_repo_name}'),
            ('${user_trigger_id}', 'github_username', '${github_username}'),
            ('${user_trigger_id}', 'lastchecked', '${current_time}')
        `

    await db_adm_conn.query(querystr);

    res.status(201).send({ user_trigger_id: user_trigger_id })
}

const checkEachGithubPR = async (info) => {
    const access_token = await get_access_token('github', info.user_id);
    if (access_token == null)
        return null;
    var gh = new GitHub({
        token: access_token
    });


    var fork = await gh.getRepo(info.github_username, info.github_repo_name);

    var pullrequests = await fork.listPullRequests({}, (s) => { console.log(s) })

    pullrequests = pullrequests["data"]

    let ret = []

    for (let i = 0; i < pullrequests.length; i++) {
        const cur = pullrequests[i]

        const title = cur["title"]
        const state = cur["state"]

        const tm = cur["updated_at"]
        const dateString = new Date((tm || "").replace(/-/g,"/").replace(/[TZ]/g," "));
        const secs = dateString.getTime() / 1000

        const username = cur["user"]["login"]

        //console.log(`Title: ${title}, username: ${username}, state: ${state}, secs: ${secs}`)

        if (secs + 3600 > info.lastchecked) {
            ret.push({
                title: title,
                username: username,
                state: state,
                timestamp: tm,
            });
        } else {
            break;
        }
    }

    if (ret.length === 0) {
        console.log("There is no new PR");
    } else {
        ret.forEach((elem) => {
            console.log(`New pr\n  - from: ${elem.username} (${elem.title})\n  - at ${elem.timestamp}\n  - state: "${elem.state}"`)
        });
    }
    return ret;
}

export const checkGithubPR = async() => {
    console.log("Checking github pr's")
    var res = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
            FROM user_trigger ut
                JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
                JOIN triggers t ON t.trigger_id = ut.trigger_id
            WHERE t.trigger_name = 'repo-pullrequest'
            ORDER BY ta.user_trigger_id, ta.argument_name
    `)

    let triggers = []

    for (let i = 0; i < res.rows.length; i += 3) {
        const cur = res.rows[i];
        const next = res.rows[i + 1];
        const nextnext = res.rows[i + 2];
        triggers.push({
            github_repo_name: cur.argument_value,
            github_username: next.argument_value,
            lastchecked: nextnext.argument_value,
            user_trigger_id: cur.user_trigger_id,
            user_id: cur.user_id
        })
    }

    if (triggers.length == 0)
        return

    for (var i = 0; i < triggers.length; i++) {
        console.log(`Github PR: Entry ${i}: repo[${triggers[i].github_repo_name}], name[${triggers[i].github_username}], id = ${triggers[i].user_id}`)
        const ret = await checkEachGithubPR(triggers[i])
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

export const createGithubPRTrigger = async (req, res) => {
    console.log('created github pr trigger');
    const userid = req.user.userid;
    const github_repo_name = req.body.github_repo_name
    const github_username = req.body.github_username

    if (userid === 'undefined' || github_repo_name === 'undefined' || github_username === 'undefined') {
        res.status(400).send({ Error: "wrong body" })
    }

    const trigger_id = await getTriggerId('repo-pullrequest')

    const info = await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
        FROM user_trigger ut
            JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
            JOIN triggers t ON t.trigger_id = ut.trigger_id
        WHERE t.trigger_name = 'repo-pullrequest' and
        (ta.argument_name = 'github_repo_name' or ta.argument_name = 'github_username')
        ORDER BY ta.user_trigger_id
    `)

    for (let i = 0; i < info.rows.length; i += 2) {
        if (info.rows[i].user_id == userid) {
            if (info.rows[i].argument_name == "github_repo_name" && info.rows[i].argument_value == github_repo_name) { //@fixme maybe check the other way around aswell
                if (info.rows[i + 1].argument_value == github_username) {
                    res.status(202).send({ user_trigger_id: info.rows[i].user_trigger_id })
                    return;
                }
            }
        }
    }

    var user_trigger_id_res = await db_adm_conn.query(`
        INSERT INTO
            user_trigger(user_id, trigger_id)
            VALUES ('${userid}', '${trigger_id}')
        RETURNING user_trigger_id
    `);

    var user_trigger_id = user_trigger_id_res.rows[0].user_trigger_id
    var current_time = Math.floor((new Date().getTime() - 2) / 1000);

    var querystr = `
        INSERT INTO trigger_arguments(user_trigger_id, argument_name, argument_value)
        VALUES
            ('${user_trigger_id}', 'github_repo_name', '${github_repo_name}'),
            ('${user_trigger_id}', 'github_username', '${github_username}'),
            ('${user_trigger_id}', 'lastchecked', '${current_time}')
        `

    await db_adm_conn.query(querystr);

    res.status(201).send({ user_trigger_id: user_trigger_id })
}