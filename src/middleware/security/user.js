import { db_adm_conn } from "../../modules/db/index.js";
import { checkInputBeforeSqlQuery, createErrorMessage } from '../../modules/Helper.js';
import Joi from "joi";
const schema = Joi.object({
    // firstName: Joi.string()
    //     .pattern(new RegExp('^[a-zA-Z\s\-]'))
    //     .min(3)
    //     .max(20)
    //     .required(),
    // lastName: Joi.string()
    //     .pattern(new RegExp('^[a-zA-Z\s\-]'))
    //     .min(3)
    //     .max(20)
    //     .required(),
    username: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]'))
        .min(3)
        .max(20)
        .required(),
    // phoneNumber: Joi.string()
    //     .pattern(new RegExp('^[0-9\s\+]'))
    //     .min(8)
    //     .max(20)
    //     .required(),
    password: Joi.string()
        .min(8)
        .max(72)
        .required()
})

export const checkUserIdReq = (req, res, next) => {
    if (typeof req.user.userid == 'undefined' || req.user.userid === null) {
        res.status(400).send(createErrorMessage("No valid token provided."))
        return
    }
    next()
}

export const checkCreateUserReq = async (req, res, next) => {
    const { error, value } = schema.validate(req.body)
    if (error != undefined) {
        res.status(400).send({ "Error": error })
        return
    }
    let prevCheckUsername = await db_adm_conn.query(`
        SELECT user_name
        FROM users
        WHERE user_name = '${checkInputBeforeSqlQuery(req.body.username)}'`)
    if (prevCheckUsername.rowCount != 0) {
        res.status(409).send(createErrorMessage("Username already exists"))
        return
    }
    next()
}
