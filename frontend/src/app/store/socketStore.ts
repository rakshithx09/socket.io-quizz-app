import { io, Socket } from "socket.io-client";


let socket: Socket | null = null;

export const getSocket = (quizCode: string , isHost  :boolean) => {
  if (!socket) {
    socket = io(`ws://localhost:3003?quizCode=${quizCode}&isHost=${isHost}`, { withCredentials: true });
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
