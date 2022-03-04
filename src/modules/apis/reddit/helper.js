import { client_id, client_secret} from './tokens.js'
import { get_refresh_token, get_id_by_name } from '../../db/tokens.js'
import snoowrap from 'snoowrap';
import db_adm_conn from '../../db/index.js'

// docs: https://not-an-aardvark.github.io/snoowrap/snoowrap.html
export const getClient = async (userid) => {
    if (!userid)
        return;

    const service_id = await get_id_by_name('reddit');
    if (!service_id)
        return;

    const refresh_token = await get_refresh_token(service_id, userid);
    if (!refresh_token)
        return;


    var client = new snoowrap({
        userAgent: 'AREA',
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token
    });
    return client;
}

export const getTriggerInfo = async (trigger_name) => {
    return await db_adm_conn.query(`
        SELECT ta.user_trigger_id, ta.argument_value, ta.argument_name, ut.user_id
        FROM user_trigger ut
            JOIN trigger_arguments ta ON ta.user_trigger_id = ut.user_trigger_id
            JOIN triggers t ON t.trigger_id = ut.trigger_id
        WHERE t.trigger_name = '${trigger_name}'
        ORDER BY ta.user_trigger_id
    `)
}
