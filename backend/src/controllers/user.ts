import { Response } from "express";
import { AuthenticatedRequest } from "../auth";
import db from "../db"

/* handler for /get-user route */
export const getUserHandler = (req: AuthenticatedRequest, res: Response) => {
    console.log(" getUserHandler trigggered")
    res.json({
        success: true,
        message: "user fetched",
        user: req.user
    })
}

/* handler for /isHost route */
export const isHostHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const { quizCode } = req.body;

        if (!quizCode) {
             res.status(400).json({ success: false, message: "quiz code is required" });
             return;
        }

        const quiz = await db.quiz.findUnique({
            where: { quizCode }
        });

        if (!quiz) {
             res.status(404).json({ success: false, message: "quiz not found" });
             return;
        }

        const isHost = quiz.hostId === user?.uid;

        res.json({
            success: true,
            message: "user is host",
            isHost
        });
        return;
    } catch (error) {
        console.error("error in isHostHandler:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

