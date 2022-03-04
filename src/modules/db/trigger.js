import db_adm_conn from "./index.js"
import { checkInputBeforeSqlQuery } from "../Helper.js"
export const getTriggerId = async (trigger_name) => {
    var res = await db_adm_conn.query(`
    SELECT trigger_id FROM triggers WHERE trigger_name = '${checkInputBeforeSqlQuery(trigger_name)}';`)
    if (res.rows.length == 0)
        throw Error(`triggername ${checkInputBeforeSqlQuery(trigger_name)} not found`)
    return res.rows[0].trigger_id
}