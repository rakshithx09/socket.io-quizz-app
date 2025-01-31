import { Server } from "socket.io";
import db from "./db"
import { addQuestions } from "./lib/quiz";
export const initWs = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
          origin: "http://localhost:3000", // Allow only the frontend origin
          methods: ["GET", "POST"],
          credentials: true
        }
      });

    io.listen(3003);
    io.on('connection', async (socket) => {
        try {
            console.log(" connection recv from:", socket.handshake.address);
            console.log("full handshake:", socket.handshake);

            const quizCode = socket.handshake.query.quizCode;
            console.log("successfully connected, quiz code:", quizCode);

            if(!quizCode){
                throw new Error("quiz code not found in connection handshake")
            }
            const quizData = await db.quiz.findUnique({
                where : {
                    quizCode : quizCode as string
                }
            })
            socket.emit("init-quiz", {
                quizData ,
                questions: await db.question.findMany({
                    where : {
                        quizId : quizData?.id
                    }
                })
             })



            socket.on("submit-questions", async (data) => {
                addQuestions(data, socket);
                console.log("submitted questions :  ",data)
            })

        } catch (error) {
            console.error("Error ", error.message)
        }

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}