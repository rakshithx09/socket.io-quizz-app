import { Server } from "socket.io";
import db from "./db"
import { addQuestions } from "./lib/quiz";
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
            console.log("full handshake:", socket.handshake);

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

            io.to(`${quizCode}-host`).emit("init-quiz", {
                quizData,
                questions: await db.question.findMany({
                    where: {
                        quizId: quizData?.id
                    }
                })
            })
            io.to(quizCode).emit("participant-quiz", {
                ...quizData
                
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