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
        console.log("exisiting user: ", existingUser)

        let createdUser;
        if (!existingUser) {
            createdUser = await db.user.create({
                data: {
                    firebaseUid: user.uid,
                    email: user.email!,
                },
            });
            console.log("created user: ", createdUser)
        } else {
            createdUser = existingUser;
        }

        const createdQuiz = await db.quiz.create({
            data: {
                hostId: user.uid,
                quizCode,
            },
        });
        console.log("createdQuiz: ", createdQuiz)

        await db.quizSession.create({
            data: {
                userId: createdUser.firebaseUid,
                quizId: createdQuiz.id,
                score: 0,
            }
        });

        console.log("quiz created successfully", createdQuiz);

        res.json({ success: true, message: "quiz created", quiz: createdQuiz, user: createdUser });
    } catch (error) {
        console.error("errr creating quiz or user:", error.message);
        res.status(500).json({ success: false, message: "server error" });
    }
};

export const joinQuizHandler = async (req: AuthenticatedRequest, res: Response) => {
    console.log("joinQuizHandler triggered ")
    const { quizCode } = req.body;
    const user = req.user;

    try {
        if (!quizCode) {
            throw new Error("quizCode is not sent in body")
        }
        if (!user?.uid) {
            throw new Error("user doesnt have uid");
        }

        const quiz = await db.quiz.findUnique({
            where: { quizCode },
        });

        if (!quiz) {
            res.status(404).json({ success: false, message: "quiz not found" });
            return;
        }
        console.log("uid ::" , user.uid)
        const existingSession = await db.quizSession.findFirst({
            where: {
                quizId: quiz.id,
                userId: user.uid,
            },
        });
        if (quiz.state == 'active') {
            if (existingSession) {
                res.status(200).json({ success: true, message: "user joined quiz succesfully",session: existingSession, quiz });
                return;
            }
        }else{
            res.status(400).json({ success: false, message: "Quiz has already ended" });
                return;
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

        const createdSession = await db.quizSession.create({
            data: {
                userId: createdUser.firebaseUid,
                quizId: quiz.id,
                score: 0,
            }
        });

        console.log("user joined quiz successfully", createdSession);

        res.json({ success: true, message: "user joined the quiz", session: createdSession, quiz });
        return;
    } catch (error) {
        console.error("error joining quiz:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
