import dotenv from "dotenv"
dotenv.config()
import express from "express";
import { createServer } from "http";
import {Server} from "socket.io";
import cors from "cors";
import { initWs } from "./ws";
import { initHttp } from "./http";

const app = express();
app.use(cors());
const httpServer = createServer(app);

 /* initialise websocket server*/
initWs(httpServer);
/* initialise http server */
initHttp(app)
const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});

