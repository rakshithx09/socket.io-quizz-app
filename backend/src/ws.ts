import { Server } from "socket.io";

export const initWs = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.listen(3003);
    io.on('connection', async (socket) => {
        try {
            console.log(" connection recv from:", socket.handshake.address);
            console.log("full handshake:", socket.handshake);

            const quizCode = socket.handshake.query.quizCode;
            console.log("successfully connected, quiz code:", quizCode);

        } catch (error) {
            console.error("Error ", error.message)
        }

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}