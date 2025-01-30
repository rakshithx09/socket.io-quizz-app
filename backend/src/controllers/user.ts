import { Response } from "express";
import { AuthenticatedRequest } from "../auth";

export const getUserHandler = (req:AuthenticatedRequest , res : Response) => {
    console.log(" getUserHandler trigggered")
    res.json({
        success: true,
        message: "user fetched",
        user : req.user
    })
}