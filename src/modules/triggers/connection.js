import db_adm_conn from "../db/index.js"
import { checkInputBeforeSqlQuery } from "../Helper.js"

export const deleteConnection = async (req, res) => {
    await db_adm_conn.query(`
    DELETE FROM user_trigger WHERE user_trigger_id = '${checkInputBeforeSqlQuery(req.params.id)}'`)
    res.send()
}