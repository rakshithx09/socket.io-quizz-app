import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;

export const getSocket = (quizCode: string) => {
  if (!socket) {
    socket = io(`ws://localhost:3003?quizCode=${quizCode}`, { withCredentials: true });
    console.log("New socket connection made")
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
