"use client";
import { useParams } from "next/navigation";
import useStore from "../../store/quizStore";
import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/app/store/socketStore";
import HostDashboard from "@/app/components/hostDashboard";
import ParticipantDashboard from "@/app/components/participantDashboard";
import { fetchUser } from "@/app/lib/user";

const QuizPage = () => {
  const { quizCode } = useParams();
  const { quiz, setQuiz } = useStore();
  const [isHost, setIsHost] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAndSetUser = async () => {
      const user = await fetchUser();
      console.log("user ::", user);
      setUser(user);
    };
  
    fetchAndSetUser();
  }, []);  
  
  useEffect(() => {
    if (!user) return; 
  
    const socket = getSocket(quizCode as string);
  
    socket.on("init-quiz", (data) => {
      console.log("data from socket: ", data);
      console.log("uid ", user);
      setIsHost(data.quizData.hostId === user?.uid);  
      setQuiz(data);
    });
  
    return () => {
      socket.off("init-quiz");
      disconnectSocket();
    };
  }, [quizCode, user, setQuiz]);

  if (!quiz) return <p>Loading quiz...</p>;

  return isHost ? <HostDashboard quizCode={quizCode as string} /> : <ParticipantDashboard quizCode={quizCode as string} />;
};

export default QuizPage;
