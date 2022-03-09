import { db_adm_conn } from "../db/index.js";
import { json } from "express";
import { checkInputBeforeSqlQuery } from '../Helper.js';
export const down = async (req, res) => {
    console.log(__basedir)
    res.download(__basedir + '/data/client.apk', (error) => {
        if (error) {
            console.log(error)
            return
        }
    })
}
export const getSubscriptions = async (req, res) => {
    var user_id = req.user.userid
    var rows = await db_adm_conn.query(`
    SELECT se.service_name
    FROM services se
    JOIN subscriptions su ON su.service_id = se.service_id
    JOIN users u ON u.user_id = su.user_id
    WHERE u.user_id = '${checkInputBeforeSqlQuery(user_id)}'`);
    var ar = []
    for (var row of rows.rows) {
        ar.push(row.service_name)
    }
    res.send({ services: ar })
}

export const getConnections = async (req, res) => {
    var user_id = req.user.userid
    var rows = await db_adm_conn.query(`
    SELECT DISTINCT t.trigger_name, ut.user_trigger_id as connection_id, r.reaction_name, c.trigger_reaction_name as connection_name
    FROM user_trigger ut
    JOIN users u ON u.user_id = ut.user_id
    JOIN triggers t ON t.trigger_id = ut.trigger_id
    JOIN trigger_reactions c ON c.user_trigger_id = ut.user_trigger_id 
    JOIN reactions r ON r.reaction_id = c.reaction_id
    WHERE u.user_id = '${checkInputBeforeSqlQuery(user_id)}'`)
    res.send({ connections: rows.rows })
}
