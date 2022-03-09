import { Router } from 'express'
const router = Router();
import { urlencoded } from 'express';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import { getAbout } from '../modules/about.js'
//import { getEcho, getUsers } from '../modules/db/index.js'
import {
    getEcho
    , getUsers
    , whatTimePGQL
    , poolExample
    , showTables
} from '../modules/db/index.js'
import logger from '../middleware/logger.js'


// import { dbPool2 } from '../modules/sketches/herokupgsql.js'

router.use(json({ limit: '200kb' }));
router.use(urlencoded({ extended: true }));
router.use(cookieParser());
router.use(logger);

router.get('/welcome', (req, res) => {

    res.status(200).send("Welcome 🙌 ");

})

router.get('/client.apk', (req, res) => {
    res.download('../../data/client.apk', (error) => {
        if (error) {
            console.log(error)
            res.status(500).send(error)
            return
        }
        else
            res.sendStatus(200)
    })
})

//DB TEST FUNCS
// router.get('/pg', dbPool2)
router.get('/pgtables', showTables)
router.get('/time', poolExample)


router.get('/echo', getEcho)
router.get('/users', getUsers) //should delete later
router.get('/about.json', getAbout)


export default router;
