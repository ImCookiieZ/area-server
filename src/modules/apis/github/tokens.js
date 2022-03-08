import request from 'request';
import querystring from 'querystring';

import { add_tokens } from '../../db/tokens.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from '../../Helper.js';

import db_adm_conn from "../../db/index.js";
const client_id = (await db_adm_conn.query(`SELECT client_id FROM services WHERE service_name = 'github'`)).rows[0].client_id;
const client_secret = (await db_adm_conn.query(`SELECT client_secret FROM services WHERE service_name = 'github'`)).rows[0].client_secret
const redirect_uri = 'https://karl-area-server.herokuapp.com/github/callback';

export const unsubscribe = async (req, res) => {
    var user_id = req.user.userid
    var rows = await db_adm_conn.query(`
    SELECT service_id FROM services WHERE service_name = 'github';`)
    await db_adm_conn.query(`DELETE FROM subscriptions WHERE service_id = '${checkInputBeforeSqlQuery(rows.rows[0].service_id)}' AND user_id = '${checkInputBeforeSqlQuery(user_id)}'`);
    res.send()    
}
export const login = async (req, res) => {

    var state = req.cookies.YEPAreaToken || null;
    if (state === null) {
        res.status(400).send("Missing access_token")
        return
    }
    var scope = 'repo admin:public_key notifications user delete_repo workflow';
    
    res.send('https://github.com/login/oauth/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
}

export const loginApp = async (req, res) => {

    var state = req.cookies.YEPAreaToken || null;
    if (state === null) {
        res.status(400).send("Missing access_token")
        return
    }
    var scope = 'repo admin:public_key notifications user delete_repo workflow';
    
    res.redirect('https://github.com/login/oauth/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
}

export const store_tokens = async (req, res) => {
    try {
        var code = req.query.code || null;
        var state = req.query.state || null;

        if (state === null) {
            console.log("state is null")
            res.status(400).send(createErrorMessage("Bad request"))
        } else {
            var authOptions = {
                url: 'https://github.com/login/oauth/access_token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    client_id: client_id,
                    client_secret: client_secret
                },
                json: true
            };

            request.post(authOptions, async (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    var access_token = body.access_token,
                        refresh_token = body.access_token;
                    var ret = await add_tokens(req.user.userid, access_token, refresh_token, 3542515691, 'github')
                    if (ret.ret_value === true) {
                        // TODO: maybe use state as redirect URL
                        // res.redirect('https://karl-area-server.herokuapp.com/github/login?' +
                        //     querystring.stringify({
                        //         access_token: access_token
                        //     }))
                        //TODO: redirect to own webpage
                        res.cookie("YEPAreaToken", state, {
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000,
                            Secure: true
        });
                        res.redirect("http://localhost:3000/profile")
                        // res.send({ access_token: access_token, refresh_token: refresh_token, expires_in: 3542515691 })
                    } else {
                        console.log(ret.line_value)
                        res.status(500).send(createErrorMessage(ret.line_value))
                    }
                } else {
                    if (typeof err != "undefined")
                        console.log(err.stack)
                    res.status(403).send(createErrorMessage(response.statusMessage))
                }
            });
        }
    } catch (err) {
        console.log(err.stack)
        res.status(500).send(createErrorMessage("Internal Server Error"))
    }
}
