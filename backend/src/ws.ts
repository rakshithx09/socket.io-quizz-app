import { Server } from "socket.io";
import db from "./db"
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
                throw new Error("Quiz code not found in connection handshake")
            }
            socket.emit("init-quiz", {
                quizData : await db.quiz.findUnique({
                    where : {
                        quizCode : quizCode as string
                    }
                })
             })

        } catch (error) {
            console.error("Error ", error.message)
        }

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}