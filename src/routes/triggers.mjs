import { Router } from 'express'
import { secureRouteMiddleware, secureCallback } from '../middleware/security/secureRouting.js'
import db_adm_conn from '../modules/db/index.js'
import { checkInputBeforeSqlQuery } from "../modules/Helper.js"

const router = Router();

//Route to get Argument names trigger
//Route to get Argument names reaction


//Route To get all possible reactions to a trigger
const get_reactions_to_trigger = async (req, res) => {
    const ret = await db_adm_conn.query(`
    SELECT reaction_name as reactions, service_name as service
    FROM reactions r
    JOIN trigger_reaction_options tro using(reaction_id)
    JOIN triggers t using(trigger_id)
    JOIN services s on r.service_id = s.service_id
    WHERE t.trigger_id = '${checkInputBeforeSqlQuery(req.params.trigger_id)}' 
    `)

    res.status(200).send(ret.rows)
}
router.get('/reactions_to_trigger/:trigger_id', secureRouteMiddleware, get_reactions_to_trigger)

//Route To get all possible reactions to a trigger
const get_reactions_to_user_trigger = async (req, res) => {
    const ret = await db_adm_conn.query(`
    SELECT reaction_name as reactions, service_name as service
    FROM reactions r
    JOIN trigger_reaction_options tro using(reaction_id)
    JOIN triggers t on t.trigger_id = tro.trigger_id
    JOIN services s on r.service_id = s.service_id
    JOIN user_trigger ut on ut.trigger_id = t.trigger_id
    WHERE ut.user_trigger_id = '${checkInputBeforeSqlQuery(req.params.user_trigger_id)}' 
    `)

    res.status(200).send(ret.rows)
}
router.get('/reactions_to_user_trigger/:user_trigger_id', secureRouteMiddleware, get_reactions_to_user_trigger)


//Route to get trigger available for service
const get_triggers_of_service = async (req, res) => {
    const ret = await db_adm_conn.query(`
        SELECT trigger_name
        FROM triggers
        JOIN services USING (service_id)
        WHERE service_name = '${checkInputBeforeSqlQuery(req.params.service_name)}'
    `)

    res.status(200).send(ret.rows)
}
router.get('/triggers_of_service/:service_name', secureRouteMiddleware, get_triggers_of_service)

export default router;
