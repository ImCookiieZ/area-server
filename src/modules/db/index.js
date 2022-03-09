import pg from 'pg'
import { checkInputBeforeSqlQuery } from '../Helper.js';

const Client = pg.Client;
const Pool = pg.Pool;

// console.log('this is db_vars:',
//     process.env.POSTGRES_USER, process.env.POSTGRES_PORT, process.env.POSTGRES_HOST, process.env.POSTGRES_DB);

//const connectionString =  'postgres://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + DB_STRING

// const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
// const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
//const connectionString =  process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}${DB_STRING}`
const connectionString = `postgres://lfhuvxpuwdgvew:f53fa74258296c7cf1b8a18a5dd39ad2f8b3d459ef63b74d8bbb3fd0bc270866@ec2-54-73-178-126.eu-west-1.compute.amazonaws.com:5432/dc7pnn7cj0ruiu`

export const poolExample = (req, res) => {

    console.log('[EXAMPLE] I am DB Pool example func')

    let pool;

    // if (process.env.NODE_ENV == 'production') {
    //     pool = new Pool({

    //         connectionString: process.env.DATABASE_URL,
    //         max: 20,
    //         idleTimeoutMillis: 30000,
    //         connectionTimeoutMillis: 2000,
    //         ssl: {
    //             rejectUnauthorized: false,
    //         },
    //     });
    // }

    pool = new Pool({
        connectionString: connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    })


    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT NOW()', (err, result) => {
            release()
            if (err) {
                return console.error('Error executing query', err.stack)
            }
            console.log(result.rows)
            res.status(200).send(result.rows)
        })
    })
}

export let db_adm_conn;
// if (process.env.NODE_ENV !== 'production') {
db_adm_conn = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
      }
});

// } else {
//     db_adm_conn = new Client({
//         connectionString: process.env.DATABASE_URL,
//         ssl: {
//             rejectUnauthorized: false
//         }
//     });
// }
db_adm_conn.connect();


export const showTables = (req, res) => {
    db_adm_conn.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row));
        }
    });
    res.status(200).json({ "msg": "showtables function" })
}

export const whatTimePGQL = (res, req) => {

    db_adm_conn.query('SELECT NOW()', (err, result) => {
        if (err) {
            res.status(500).json(err.stack)
            return console.error('Error executing query', err.stack)
        }
        console.log(result.rows)
        res.status(200).send(result.rows)
    })
}

export const getEcho = async (req, res) => {
    res.send(JSON.stringify(req.query));
};

export const getUsers = async (req, res) => {
    console.log('[LOGGER], getUsers func')
    res.send((await db_adm_conn.query(`SELECT * FROM users`)).rows);
};

export const getPossibilitiesForTrigger = async (req, res) => {
    res.send(await db_adm_conn.query(`
    SELECT reaction_name as reactions, service_name as service
    FROM reactions r 
    JOIN trigger_reaction_options tro ON tro.reaction_id = r.reaction_id
    JOIN triggers t ON t.trigger_id = tro.trigger_id
    JOIN services s ON r.service_id = s.service_id
    WHERE t.trigger_name = '${checkInputBeforeSqlQuery(req.query.triggername)}' `))
}

export default db_adm_conn
