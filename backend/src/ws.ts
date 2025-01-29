import { Server } from "socket.io";

export const initWs = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    
    io.listen(3003);
    io.on('connection', (client) => {
        client.on('event', data => { /* … */ });
        client.on('disconnect', () => { /* … */ });
      });
}