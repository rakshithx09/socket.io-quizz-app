"use client";
import { useParams } from "next/navigation";
import useStore from "../../store/quizStore";
import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/app/store/socketStore";
import HostDashboard from "@/app/components/hostDashboard";
import ParticipantDashboard from "@/app/components/participantDashboard";
import { fetchUser } from "@/app/lib/user";
import { API_URL } from "@/app/page";

const QuizPage = () => {
  const { quizCode } = useParams();  /* fetch quiz code from url params */
  const { /* state management variables and setter functions */
    quiz,
    setQuiz,
    questions,
    setQuestions,
    addQuestion,
    isHost,
    setIsHost,
    participantQuiz,
    setParticipantQuiz,
    setUser,
    user
  } = useStore();
/* 
  const [user, setUser] = useState(null); */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetUser = async () => {
      const user = await fetchUser();
      /* console.log("User:", user); */
      setUser(user);

      if (user) {
        try {
          const token = localStorage.getItem("token")  /* fetch access token from local storage */
          const response = await fetch(`${API_URL}/isHost`, {    /* check wheter logged in user is host or not */
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quizCode }),
          });

          const data = await response.json();
          console.log("isHost response:", data);
          setIsHost(data.isHost);
        } catch (error) {
          console.error("error checking ishost :", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndSetUser();
  }, [quizCode, setIsHost]);

  useEffect(() => {
    if (!user || loading) return;

    const socket = getSocket(quizCode as string, isHost); /* create socket if not exists or fetch exisiting socket connection to quiz */
    
    socket.on("init-quiz", (data) => {  /* even listener to get inital quiz data */
      console.log("init-quiz event:", data); /* host gets basic quiz data with question answers */
     
        setQuiz(data.quizData);
        setQuestions(data.questions)
     
    });

    socket.on("participant-quiz", (data) => { /* participant just gets basic quiz data  */
      console.log("participant-quiz event:", data);
      setParticipantQuiz(data);
    });

    socket.on("question-added", async (data) => {  /* the questions added to db are sent here to be stored in state */
      console.log("question received from socket:", data);
      addQuestion(data);
    });

    return () => {
      socket.off("init-quiz");
      socket.off("participant-quiz");
      socket.off("question-added");
      disconnectSocket();
    };
  }, [quizCode, user, loading, setQuiz, setQuestions, addQuestion, isHost, setIsHost, setParticipantQuiz]);

  if (loading) return <p>Loading...</p>;
  if (!quiz && !participantQuiz) return <p>Quiz not found</p>;

  return isHost ? (
    <HostDashboard quizCode={quizCode as string} />
  ) : (
    <ParticipantDashboard quizCode={quizCode as string} />
  );
};

export default QuizPage;
