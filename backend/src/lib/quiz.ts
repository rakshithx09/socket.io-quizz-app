import { Socket } from "socket.io";
import db from "../db";

interface Question {
    text: string;
    options: string[];
    quizCode: string;
    correctAnswer: number;
}
export const addQuestions = async (questions: Question[], socket: Socket, io) => {
    try {
        if (!questions || questions.length === 0) {
            throw new Error("questions not received");
        }

        for (const question of questions) {
            const existingQuiz = await db.quiz.findUnique({
                where: { quizCode: question.quizCode }
            });

            console.log("existing quiz:", existingQuiz);

            if (!existingQuiz) {
                throw new Error("quiz doesn't exist");
            }
            if (existingQuiz.state === "ended") {
                throw new Error("quiz has ended");
            }

            const createdQuestion = await db.question.create({
                data: {
                    text: question.text,
                    answer: question.correctAnswer.toString(),
                    quizId: existingQuiz.id,
                    options: JSON.stringify(question.options)
                }
            });

            if (!!createdQuestion) {
                
                io.to(`${question.quizCode}-host`).emit("question-added", {
                    ...question
                });
            }

            console.log("question added successfully");
        }
    } catch (error) {
        console.error("addQuestions failed:", error.message);
    }
};
