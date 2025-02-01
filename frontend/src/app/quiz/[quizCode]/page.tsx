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
  const { quiz, setQuiz , questions, setQuestions,addQuestion, isHost, setIsHost, participantQuiz,setParticipantQuiz} = useStore();
  const [socket, setSocket] = useState();
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
  
    const socket = getSocket(quizCode as string, isHost);
    socket.on("init-quiz", (data) => {
      console.log("data from socket: ", data);
      console.log("uid ", user);
      console.log("host event")
      if(data.quizData.hostId === user?.uid){
          setIsHost(true); 
          setQuiz(data.quizData);
      setQuestions(data.questions) 
      }else{
        setIsHost(false)
      }
      
      
       
    });
    socket.on("participant-quiz", (data) => {
      console.log("data from socket: ", data);
      console.log("uid ", user);
      console.log("participant event")
      setIsHost(data.hostId === user?.uid);  
      setParticipantQuiz(data);
    });

    socket.on("question-added", async (data) => {
      console.log("Question recieved from socket  :: ", data)
      addQuestion(data)
    })
  
    return () => {
      socket.off("init-quiz");
      disconnectSocket();
    };
  }, [quizCode, user, setQuiz, setQuestions, addQuestion, isHost, setIsHost, setParticipantQuiz]);

  if (!quiz && !participantQuiz) return <p>Loading quiz...</p>;

  return isHost ? <HostDashboard quizCode={quizCode as string} /> : <ParticipantDashboard quizCode={quizCode as string}  />;
};

export default QuizPage;
