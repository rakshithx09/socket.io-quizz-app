import { DefaultEventsMap, Server } from "socket.io";
import db from "./db"
import { addQuestions, handleAnswerSubmission, sendNextQuestion } from "./lib/quiz";

export type QuizState = Record<string, {
    activeQuestionIndex: number;
    questionOrder: string[];
    timer: NodeJS.Timeout | null;
}>


const quizState: QuizState = {};


export const initWs = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.listen(3003);

    /* handler for client connecting to server */
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
                socket.join(`${quizCode}-host`);   /* host joins a room suffixed with host  */
            } else {
                socket.join(quizCode);
                console.log(`${socket.id} joined room ${quizCode}`); /* participant joins a room with quizcode as room id  */
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
                questions  /* sending inital quiz data along with question and answers to host */
            })
            io.to(quizCode).emit("participant-quiz", {
                ...quizData /* sending just inital quiz data to participant */

            })

            /* listener for start quiz from client */
            socket.on("start-quiz", async () => {
                try {
                    if (isHost !== "true") return;

                    console.log(`starting quiz for ${quizCode}`);

                    /* notify clients that quiz started */
                    io.to(`${quizCode}-host`).emit("quiz-started");
                    io.to(quizCode).emit("quiz-started");

                    const questions = await db.question.findMany({
                        where: { quizId: quizData?.id }
                    });

                    quizState[quizCode as string] = {
                        activeQuestionIndex: 0,
                        questionOrder: questions.map((q) => q.id),
                        timer: null
                    };

                    await db.quiz.update({
                        where: { quizCode: quizCode as string },
                        data: { state: "active" }
                    });
                    /* time limit */
                    let timeLeft = 10;
                     /*  send active question to participant */
                    await sendNextQuestion(io, quizCode as string, quizState);

                    quizState[quizCode as string].timer = setInterval(async () => {
                        if (timeLeft > 0) {
                            timeLeft--;
                            io.to(quizCode).emit("timer-update", { timeLeft }); /*  send realtime timer data to participant */
                        } else {
                            /* alert participant that time is up and ask to submit answer */
                            io.to(quizCode).emit("time-up");

                            quizState[quizCode as string].activeQuestionIndex += 1; /* move to next question */
                            const hasMoreQuestions = await sendNextQuestion( /*  send active question to participant */
                                io,
                                quizCode as string,
                                quizState
                            );

                            if (!hasMoreQuestions) {
                                clearInterval(quizState[quizCode as string].timer!);

                                /* alert clients quiz has ended */
                                io.to(quizCode).emit("quiz-ended");
                                io.to(`${quizCode}-host`).emit("quiz-ended");
                            } else {
                                timeLeft = 10;
                            }

                        }
                    }, 1000);
                } catch (error) {
                    console.log(error.message);
                }
            });

            /* listener for end quiz from client */
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

                    /* alert clients quiz has ended */
                    io.to(quizCode).emit("quiz-ended");
                    io.to(`${quizCode}-host`).emit("quiz-ended");
                } catch (error) {
                    console.log(error.message)
                }



            })
            
            /* listener for close from client */
            socket.on("close-quiz", async () => {
                try {
                    if (isHost !== "true") return;
                    console.log(`closing quiz for ${quizCode}`);

                    if (quizState[quizCode as string]) {
                        if (quizState[quizCode as string].timer) {
                            clearInterval(quizState[quizCode as string].timer!);
                        }
                        delete quizState[quizCode as string];
                    }

                    await db.quiz.update({
                        where: {
                            quizCode: quizCode as string
                        },
                        data: {
                            state: "closed"
                        }
                    });
                    /* alert clients quiz has closed */
                    io.to(quizCode).emit("quiz-closed");
                    io.to(`${quizCode}-host`).emit("quiz-closed");
                } catch (error) {
                    console.log(error.message);
                }
            });


            /* listener for host adding questions */
            socket.on("submit-questions", async (data) => {
                addQuestions(data, socket, io); /*  adding questions to DB */
                console.log("submitted questions :  ", data)
            })


            /* listener for participants submitting answers */
            socket.on("submit-answer", async (data) => {
                console.log("submission received from : ", data);
                await handleAnswerSubmission(socket, io, data);
            });
        } catch (error) {
            console.error("Error ", error.message)
        }

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}


