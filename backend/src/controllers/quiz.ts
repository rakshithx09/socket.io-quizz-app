import { Request, Response } from "express";
import { AuthenticatedRequest } from "../auth";
import db from "../db";

export const createQuizHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { quizCode } = req.body;
    const user = req.user;

    try {
        if (!user?.uid) {
            throw new Error("user doesn't have uid");
        }

        const existingUser = await db.user.findUnique({
            where: { firebaseUid: user.uid },
        });

        let createdUser;
        if (!existingUser) {
            createdUser = await db.user.create({
                data: {
                    firebaseUid: user.uid,
                    email: user.email!,
                },
            });
        } else {
            createdUser = existingUser;  
        }
        const createdQuiz = await db.quiz.create({
            data: {
                hostId: user.uid,
                quizCode,
            },
        });
        console.log("quiz created succesfully", createdQuiz)

        res.json({ success: true, message: "Quiz created", quiz: createdQuiz, user: createdUser });
    } catch (error) {
        console.error("Error creating quiz or user:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
