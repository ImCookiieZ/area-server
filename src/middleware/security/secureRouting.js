import jwt from 'jsonwebtoken';
import { db_adm_conn } from '../../modules/db/index.js'
import {checkInputBeforeSqlQuery, createErrorMessage} from '../../modules/Helper.js'
export const checkUserExists = async (user) => {
    if (typeof user.userid == "undefined" || user.userid == null)
        return false
    let response = await db_adm_conn.query(`
    SELECT COUNT (user_id) FROM users WHERE user_id = '${checkInputBeforeSqlQuery(user.userid)}'`)
    if (response.rows[0].count == 1) {
        return true
    }
    return false
}

export const secureRouteMiddleware = (req, res, next) => {
    const token = req.cookies.YEPAreaToken;
    let header_token = req.headers['authorization']
    if (typeof token != "undefined" && token != null) {
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
            if (!checkUserExists(user))
                throw "user does not exist"
            next();
        } catch (error) {
            res.clearCookie("YEPAreaToken");
            res.status(401).send(createErrorMessage("401 Unauthorized"));
        }
    } else
        if (typeof header_token != "undefined" && header_token != null) {
            try {
                if (header_token.indexOf("Bearer ") != 0)
                    throw "no valid bearer"
                header_token = header_token.substring(7)
            const user = jwt.verify(header_token, process.env.JWT_SECRET);
            
                req.user = user;
                if (!checkUserExists(user)){
                    console.log("user not existing")
                    res.status(401).send(createErrorMessage("401 Unauthorized User does not exist"));
                }else
                    next();
            } catch (error) {
                res.status(401).send(createErrorMessage("401 Unauthorized"));
            }
        } else {
            res.status(401).send(createErrorMessage("401 Unauthorized"));
        }
};

export const secureCallback = (req, res, next) => {
    const token = req.query.state || null
    if (token) {
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            req.user = user;
            if (!checkUserExists(user))
                throw "user does not exist"
            res.cookie("YEPAreaToken", token, {
                httpOnly: true,
                Secure: true

            });
            next();
        } catch (error) {
            res.clearCookie("YEPAreaToken");
            res.status(401).send(createErrorMessage("401 Unauthorized"));
        }
    } else {
        res.status(401).send(createErrorMessage("401 Unauthorized"));
    }
}
