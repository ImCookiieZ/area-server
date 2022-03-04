import { db_adm_conn } from "./index.js";
import { checkInputBeforeSqlQuery, createErrorMessage } from '../Helper.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

export const deleteUser = async (req, res) => {
    try {
        let response = await db_adm_conn.query(`
        DELETE FROM users
        WHERE user_id = '${checkInputBeforeSqlQuery(req.user.userid)}' RETURNING *;`);
        res.send({ "Deleted": response.rows });
    } catch (err) {
        console.log(err.stack);
        res.status(500).send(createErrorMessage(err.stack));
    }
};

export const createUser = async (req, res) => {
    try {
        const password = await bcrypt.hash(req.body.password, 10)
        let user = await db_adm_conn.query(`
        INSERT INTO users (user_name, password)
        VALUES 
            (
                '${checkInputBeforeSqlQuery(req.body.username)}',
                '${checkInputBeforeSqlQuery(password)}'
            ) RETURNING *;`);
        const userid = user.rows[0].user_id;
        const token = jwt.sign({ userid: userid }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("YEPAreaToken", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).send(token);
        return;
    } catch (error) {
        res.status(400).send(createErrorMessage(error.stack));
        return;
    }
};


export const login = async (req, res) => {
    // const email = req.query.email || null;
    const username = req.query.username || null;
    const password = req.query.password;

    const user = await db_adm_conn.query(`
        SELECT *
        FROM users
        WHERE user_name = '${checkInputBeforeSqlQuery(username)}';
    `);

    if (user.rows.length == 0) {
        console.log(`There is no user with the email: ${username}`);
        res.status(404).send(createErrorMessage(`There is no user with the username ${username}`));
        return;
    }

    if (user.rowCount == 0) {
        res.status(404).send(createErrorMessage(`User has no rows`));
        return;
    }

    const correctPassword = await bcrypt.compare(password, user.rows[0].password);
    if (user.rows[0].user_name == username && correctPassword) {
        const userid = user.rows[0].user_id;
        const token = jwt.sign({ userid: userid }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("YEPAreaToken", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).send(token);
        return;
    }
    res.status(401).send(createErrorMessage("Wrong credentials"));
};
