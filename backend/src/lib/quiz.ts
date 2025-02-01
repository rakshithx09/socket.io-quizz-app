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

/* send next question to participant */
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


/* check if answer is correct when participant submits */
export const validateAnswer = async ( qid: string, answer: number) => {
    const question = await db.question.findUnique({
        where: { id: qid },
    });

    if (!question) {
        throw new Error("Question not found");
    }

    const isCorrect = question.answer === answer.toString();
    console.log("answer is : ",isCorrect)
    return isCorrect;
};

/* update leaderboard */
export const updateLeaderboard = async (quizCode: string) => {
    const quizSessions = await db.quizSession.findMany({
        where: { quizId: quizCode },
        include: { user: true },
    });

    const leaderboard = quizSessions.sort((a, b) => b.score - a.score);

    return leaderboard.map((session, index) => ({
        rank: index + 1,
        username: session.user.email,
        score: session.score,
    }));
};

/* validate and update leaderboard when answer is submitted */
export const handleAnswerSubmission = async (
    socket: any,
    io: Server,
    data: { qid: string, quizCode:string,quizId: string, answer: number, uid: string }
) => {
    const { qid, quizId,quizCode, answer, uid } = data;
    console.log("quizId in handleAnswerSubmission : ", quizId)
    try {
        const isCorrect = await validateAnswer( qid, answer);

        if (isCorrect) {
            const quizSession = await db.quizSession.findFirst({
                where: {
                    quizId,
                    userId: uid,
                },
            });
            console.log("quizSession :", quizSession)

            if (quizSession) {
                console.log("quizsession update triggered")
                await db.quizSession.update({
                    where: { id: quizSession.id },
                    data: {
                        score: quizSession.score + 10,
                    },
                });
            }else{
                throw new Error("Couldnt find quiz session in handleAnswerSubmission ")
            }
        }

        const leaderboard = await updateLeaderboard(quizId);
        console.log("leaderboard :: ", leaderboard)

        /* broadcast updated leaderboard to all clients */
        io.to(quizCode).emit("leaderboard-update", leaderboard);
        io.to(`${quizCode}-host`).emit("leaderboard-update", leaderboard);
    } catch (error) {
        console.error("Error handling answer submission:", error.message);
    }
};