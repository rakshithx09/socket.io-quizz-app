import { Express } from "express";
import express from "express";
import { authMiddleWare } from "./auth";
import cors from "cors";

export function initHttp(app: Express) {
    app.use(express.json());
    app.use(cors());
    app.get("/",authMiddleWare, (req , res)=>{
        res.json({ success: true, message: "Access granted",user:  req.user });
    })
}