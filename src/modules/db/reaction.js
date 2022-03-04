import db_adm_conn from "./index.js"
import { checkInputBeforeSqlQuery } from "../Helper.js"
export const getReactionId = async (reaction_name) => {
    var res = await db_adm_conn.query(`
    SELECT reaction_id FROM reactions WHERE reaction_name = '${checkInputBeforeSqlQuery(reaction_name)}';`)
    if (res.rows.length == 0)
        throw Error(`reactionname ${checkInputBeforeSqlQuery(reaction_name)} not found`)
    return res.rows[0].reaction_id
}