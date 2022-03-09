import request from 'request';
import querystring from 'querystring';
import { add_tokens, get_id_by_name, update_tokens, get_refresh_token } from '../../db/tokens.js'
import { checkInputBeforeSqlQuery, createErrorMessage } from '../../Helper.js';

import db_adm_conn from "../../db/index.js";

export const client_id =  (await db_adm_conn.query(`SELECT client_id FROM services WHERE service_name = 'spotify'`)).rows[0].client_id;
export const client_secret = (await db_adm_conn.query(`SELECT client_secret FROM services WHERE service_name = 'spotify'`)).rows[0].client_secret;
export const redirect_uri = 'https://karl-area-server.herokuapp.com/spotify/callback';

export const unsubscribe = async (req, res) => {
    var user_id = req.user.userid
    var rows = await db_adm_conn.query(`
    SELECT service_id FROM services WHERE service_name = 'spotify';`)
    await db_adm_conn.query(`DELETE FROM subscriptions WHERE service_id = '${checkInputBeforeSqlQuery(rows.rows[0].service_id)}' AND user_id = '${checkInputBeforeSqlQuery(user_id)}'`);
    res.send()    
}
export const login = async (req, res) => {

    var state = (req.cookies.YEPAreaToken || req.headers['authorization']) || null;
    if (state === null) {
        res.status(400).send(createErrorMessage("Missing access_token"))
        return
    }
    var scope = 'playlist-modify-private playlist-modify-public playlist-read-private, user-modify-playback-state user-read-playback-state';

    res.send('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: '15628e786638415eb6c9701f2574826b',
            scope: scope,
            redirect_uri: 'https://karl-area-server.herokuapp.com/spotify/callback',
            state: state
        }))
}

export const loginApp = async (req, res) => {

    var state = (req.cookies.YEPAreaToken || req.headers['authorization']) || null;
    if (state === null) {
        res.status(400).send(createErrorMessage("Missing access_token"))
        return
    }
    var scope = 'playlist-modify-private playlist-modify-public playlist-read-private, user-modify-playback-state user-read-playback-state';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: '15628e786638415eb6c9701f2574826b',
            scope: scope,
            redirect_uri: 'https://karl-area-server.herokuapp.com/spotify/callback',
            state: state
        }))
}
export const store_tokens = async (req, res) => {
    try {
        var code = req.query.code || null;
        var state = req.query.state || null;

        if (state === null || code === null) {
            console.log("state and/or code is null")
            res.status(400).send(createErrorMessage("Bad request"))
        } else {
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
            };
            console.log(authOptions)
            console.log(client_id)
            console.log(client_secret)
            request.post(authOptions, async (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    var access_token = body.access_token,
                        refresh_token = body.refresh_token,
                        expires_in = body.expires_in;
                    var ret = await add_tokens(req.user.userid, access_token, refresh_token, expires_in, 'spotify')
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
                        // res.send({ access_token: access_token, refresh_token: refresh_token, expires_in: expires_in })
                    } else {
                        res.status(500).send(createErrorMessage(ret.line_value))
                    }
                } else {
                    if (typeof err != "undefined") {
                        console.log(err.stack)
                        res.status(500).send(createErrorMessage(err.stack))
                    } else {
                        console.log(response.statusCode)
                        res.status(403).send(createErrorMessage("Invalid Token"))
                    }
                }
            });
        }
    } catch (err) {
        console.log(err.stack)
        res.status(500).send(createErrorMessage("Internal Server Error"))
    }
}

export const refresh_function = async (user_id) => {
    try {
        var service_id = await get_id_by_name('spotify')
        var refresh_token = await get_refresh_token(service_id, user_id)
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
        request.post(authOptions, async (error, response, body) => {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                refresh_token = body.refresh_token || refresh_token;
                var expires_at = Math.round(((new Date()).getTime()) / 1000) + body.expires_in - 2
                await update_tokens(access_token, refresh_token, expires_at, user_id, service_id)
                // res.send({ access_token: access_token, refresh_token: refresh_token, expires_at: expires_at })
                return true
            } else {
                if (typeof err !== "undefined") {
                    console.log(err.stack)
                } else {
                    console.log(response.statusCode)
                    console.log(response.statusMessage)
                    console.log("Invalid Token")
                }
                return false
                // res.status(500).send(createErrorMessage('Internal server error'))
            }
        })

    } catch (err) {
        console.log(err.stack)
        // res.status(500).send(createErrorMessage("Internal Server Error"))
        return false
    }
}


export const refresh = async (req, res) => {
    if (refresh_function(req.user.userid))
        res.send()
    else
        res.status(500).send(createErrorMessage("Internal Server Error"))
        
}