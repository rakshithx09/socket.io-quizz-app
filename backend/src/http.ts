import { Express } from "express";
import express from "express";
import { authMiddleWare } from "./auth";
import cors from "cors";
import db from "./db"
import { createQuizHandler, joinQuizHandler } from "./controllers/quiz";
import { getUserHandler, isHostHandler } from "./controllers/user";

export function initHttp(app: Express) {
    app.use(express.json());
    app.use(cors());
   

    app.post("/create-quiz",authMiddleWare,createQuizHandler)
    app.post("/join-quiz",authMiddleWare,joinQuizHandler)
    app.get("/get-user",authMiddleWare,getUserHandler)  /* route to get logged in user details */
    app.post("/isHost",authMiddleWare,isHostHandler)     /* route to check if logged in user is host */
}