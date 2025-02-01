import { Socket, DefaultEventsMap, Server } from "socket.io";
import db from "../db";
import { QuizState } from "../ws";

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
            if (existingQuiz.state === "closed") {
                throw new Error("quiz has closed");
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


export async function sendNextQuestion(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, quizCode: string, quizState: QuizState) {
    const quiz = quizState[quizCode];
    if (!quiz) return false;

    const { activeQuestionIndex, questionOrder } = quiz;
    const nextQuestionId = questionOrder[activeQuestionIndex];

    if (!nextQuestionId) return false;

    const question = await db.question.findUnique({
        where: { id: nextQuestionId.toString() },
        select: { id: true, text : true, options : true }
    });

    if (!question) return false;

    io.to(quizCode).emit("next-question", { 
        id: question.id,
        text: question.text,
        options: JSON.parse(question.options as string) 
    });
    console.log("Next question sent")

    return true;
}
