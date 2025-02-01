import { DefaultEventsMap, Server } from "socket.io";
import db from "./db"
import { addQuestions, sendNextQuestion } from "./lib/quiz";

export type QuizState = Record<string, { 
    activeQuestionIndex: number; 
    questionOrder: string[];
    timer: NodeJS.Timeout | null;
}> 
    

 const quizState: QuizState= {};


export const initWs = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",  
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.listen(3003);
    io.on('connection', async (socket) => {
        try {
            console.log(" connection recv from:", socket.handshake.address);
            /* console.log("full handshake:", socket.handshake); */

            const { quizCode, isHost } = socket.handshake.query;
            console.log("successfully connected, quiz code:", quizCode);

            if (!quizCode) {
                throw new Error("quiz code not found in connection handshake")
            }

            if (isHost === "true") {
                console.log(`client is the host for quiz code: ${quizCode}`);
                socket.join(`${quizCode}-host`);
            } else {
                socket.join(quizCode);
                console.log(`${socket.id} joined room ${quizCode}`);
            }
            const quizData = await db.quiz.findUnique({
                where: {
                    quizCode: quizCode as string
                }
            })

            const questions = await db.question.findMany({
                where: { quizId: quizData?.id }
            });

            io.to(`${quizCode}-host`).emit("init-quiz", {
                quizData,
                questions
            })
            io.to(quizCode).emit("participant-quiz", {
                ...quizData
                
            })

            socket.on("start-quiz", async () => {
                try {
                    if (isHost !== "true") return;

                console.log(`starting quiz for ${quizCode}`);
                io.to(`${quizCode}-host`).emit("quiz-started")
                io.to(quizCode).emit("quiz-started")

                const questions = await db.question.findMany({
                    where: { quizId: quizData?.id }
                });
    
                quizState[quizCode as string] = {
                    activeQuestionIndex: 0,
                    questionOrder: questions.map((q) => q.id),
                    timer: null
                };
                console.log("Quiz state :  ", quizState[quizCode as string])
                await db.quiz.update({
                    where: {
                        quizCode: quizCode as string
                    },
                    data: {
                        state: "active"
                    }
                })
                quizState[quizCode  as string].activeQuestionIndex = 0;
                await sendNextQuestion(io, quizCode as string, quizState);

                quizState[quizCode as string].timer = setInterval(async () => {
                    quizState[quizCode  as string].activeQuestionIndex += 1;
                    const hasMoreQuestions = await sendNextQuestion(io, quizCode  as string, quizState);

                    if (!hasMoreQuestions) {
                        clearInterval(quizState[quizCode as string].timer!);
                        
                    }
                }, 5000); 
                } catch (error) {
                    console.log(error.message)
                }
                
            });

            socket.on("end-quiz", async () => {

                try {
                    if (isHost !== "true") return;
                console.log(`ending quiz for ${quizCode}`);
                clearInterval(quizState[quizCode as string].timer!);

                await db.quiz.update({
                    where: {
                        quizCode: quizCode as string
                    },
                    data: {
                        state: "ended"
                    }
                })

                io.to(quizCode).emit("quiz-ended");
                io.to(`${quizCode}-host`).emit("quiz-ended");
                } catch (error) {
                    console.log(error.message)
                }
                

                
            })



            socket.on("submit-questions", async (data) => {
                addQuestions(data, socket, io);
                console.log("submitted questions :  ", data)
            })

        } catch (error) {
            console.error("Error ", error.message)
        }

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}


