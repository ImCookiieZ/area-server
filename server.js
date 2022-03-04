import Express from 'express'
import http from 'http'
import path from 'path'
import logger from './src/middleware/logger.js'
import swaggerUI from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

import mainRouter from './src/routes/index.mjs'; //DIR_IMPORT NOT SUPPORTED
// import historyRouter from './src/routes/historyRoutes.mjs'; //DIR_IMPORT NOT SUPPORTED
// import productRouter from './src/routes/productRoutes.mjs'; //DIR_IMPORT NOT SUPPORTED
// import settingRouter from './src/routes/settingsRoutes.mjs'; //DIR_IMPORT NOT SUPPORTED
import userRouter from './src/routes/user.mjs'; //DIR_IMPORT NOT SUPPORTED
import discordRouter from './src/modules/apis/discord/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import githubRouter from './src/modules/apis/github/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import twitchRouter from './src/modules/apis/twitch/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import spotifyRouter from './src/modules/apis/spotify/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import redditRouter from './src/modules/apis/reddit/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import dcBotRouter from './src/modules/triggers/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import dcBotReaction from './src/modules/reactions/index.mjs'; //DIR_IMPORT NOT SUPPORTED
import triggersRouter from './src/routes/triggers.mjs'


import { client as dc_bot_client } from './src/modules/apis/discord/bot.js'
import { client as twitch_bot_clien } from './src/modules/apis/twitch/bot.js'
import { HOST, PORT } from './src/config/my_env.js';
export const app = new Express();
const server = new http.Server(app);
import { checkTokens, checkTriggers } from "./src/modules/triggers/daemon.js"
import cookieParser from 'cookie-parser';
// import jwt from 'express-jwt';
import cors from 'cors'; //dont know what is it for
// import { poolExample } from './src/modules/db/index.js'
// import { dbPool2 } from './src/modules/sketches/herokupgsql.js'
const options = {
    apis: ["./src/routes/*.mjs"],
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AREA API",
            version: "1.0.0",
            description: "Api for private usage"
        },
        servers: [
            {
                url: "http://localhost:8081"
            }
        ]
    }
}

const specs = swaggerJSDoc(options)

// app.use(cors());
app.use(Express.json({ limit: '200kb' }));
app.use(Express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

app.use((req, res, next) => {
    // console.log(req)
    var origin = req.get('origin') || req.get('host');
    console.log(req.headers)
    // console.log(origin)
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Authorization, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    /*res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );*/
    next();
});
app.use(mainRouter);
app.use(userRouter);
app.use(discordRouter);
app.use(githubRouter);
app.use(twitchRouter);
app.use(spotifyRouter);
app.use(redditRouter);
app.use(dcBotRouter);
app.use(dcBotReaction);
app.use(triggersRouter);
// app.use(settingRouter);
// app.use(historyRouter);
// app.use(productRouter);

app.use(logger);

server.listen(PORT, () => console.log(`[LOGGER] The server is listening on port ${PORT}`))
await checkTokens()

await dc_bot_client.login('OTEzOTIxNzQ1ODM1MTU5NjIy.YaFh9A.VBuI_6EnDwX_3fik6uh3m195F9k');
checkTriggers();
