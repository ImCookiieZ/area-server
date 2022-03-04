import db_adm_conn from './index.js'
import { checkInputBeforeSqlQuery } from '../Helper.js';


export const add_tokens = async (user_id, access_token, refresh_token, expires_in, service_name) => {
    var expires_at = Math.round(((new Date()).getTime() - 2) / 1000) + expires_in
    var rows = await db_adm_conn.query(`
    SELECT service_id FROM services WHERE service_name = '${service_name}';`)

    try {
        await db_adm_conn.query(`DELETE FROM subscriptions WHERE service_id = '${checkInputBeforeSqlQuery(rows.rows[0].service_id)}' AND user_id = '${checkInputBeforeSqlQuery(user_id)}'`);
        var ret = await db_adm_conn.query(`INSERT INTO subscriptions (access_token, refresh_token, expires_at, service_id, user_id) 
    VALUES ('${checkInputBeforeSqlQuery(access_token)}', '${checkInputBeforeSqlQuery(refresh_token)}', '${expires_at}', '${checkInputBeforeSqlQuery(rows.rows[0].service_id)}', '${checkInputBeforeSqlQuery(user_id)}')
    RETURNING subscription_id;`)
        return { ret_value: true, line_value: ret.rows[0].id }
    } catch (err) {
        console.log(err.stack)
        return { ret_value: false, line_value: err.stack }
    }
}

export const get_id_by_name = async (name) => {
    var res = await db_adm_conn.query(`
    SELECT service_id
    FROM services
    WHERE service_name = '${checkInputBeforeSqlQuery(name)}';`)
    return res.rows[0].service_id
}

export const get_refresh_token = async (service_id, user_id) => {
    var res = await db_adm_conn.query(`
    SELECT refresh_token
    FROM subscriptions
    WHERE user_id = '${checkInputBeforeSqlQuery(user_id)}' 
        AND service_id = '${checkInputBeforeSqlQuery(service_id)}'`)

    if (res.rows.length == 0)
        return null
    return res.rows[0].refresh_token
}

export const update_tokens = async (access_token, refresh_token, expires_at, user_id, service_id) => {
    await db_adm_conn.query(`
            UPDATE subscriptions
            SET (access_token, refresh_token, expires_at) = ('${checkInputBeforeSqlQuery(access_token)}', '${checkInputBeforeSqlQuery(refresh_token)}', ${expires_at})
            WHERE user_id = '${checkInputBeforeSqlQuery(user_id)}'
                AND service_id = '${checkInputBeforeSqlQuery(service_id)}'
            RETURNING access_token;`)
}

export const get_access_token = async (service, user_id) => {
    var res = await db_adm_conn.query(`
    SELECT access_token
    FROM subscriptions su
    JOIN services s ON s.service_id = su.service_id
    WHERE su.user_id = '${checkInputBeforeSqlQuery(user_id)}' 
        AND s.service_name = '${checkInputBeforeSqlQuery(service)}'`)

    if (res.rows.length == 0)
        return null
    return res.rows[0].access_token
}