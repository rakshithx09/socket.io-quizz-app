import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper, ListItemButton } from "@mui/material";
import useStore from "../store/quizStore";
import { getSocket } from "@/app/store/socketStore";

const ParticipantDashboard = ({ quizCode }: { quizCode: string }) => {
  const { currentQuestion, setCurrentQuestion, state,participantQuiz, setState, isClosed, setIsClosed, user, leaderboard, setLeaderboard } = useStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submission, setSubmission] = useState<{ qid: string;quizId:string; quizCode:string;  answer: number | null; uid: string } | null>(null);

  const handleAnswer = (option: number | null, socket) => {
    console.log("index submitting is : ", option);
    console.log("current question id ---------", currentQuestion);
    console.log("final submitted data: ", { ...submission, answer: option });
    socket.emit("submit-answer", { ...submission, answer: option });
  };


  useEffect(() => {
    const socket = getSocket(quizCode, false);
    console.log("user from p d: ", user);

    socket.on("next-question", (data) => {
      console.log("Current question received from socket: ", data);
      setCurrentQuestion(data);
      setSelectedOption(null);
    });

    socket.on("quiz-ended", () => {
      setState(false);
      console.log("quiz-ended received");
    });

    socket.on("quiz-started", () => {
      setState(true);
      console.log("quiz-started received");
    });

    socket.on("quiz-closed", () => {
      console.log("quiz-closed received");
      setIsClosed(true);
    });

    socket.on("timer-update", (data) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on("time-up", () => {
      console.log("selected q in time-up -----: ", selectedOption);
      handleAnswer(selectedOption, socket);
    });
    socket.on("leaderboard-update", (newLeaderboard) => {
      setLeaderboard(newLeaderboard);
    });

    return () => {
      socket.off("next-question");
      socket.off("quiz-ended");
      socket.off("quiz-started");
      socket.off("quiz-closed");
      socket.off("timer-update");
      socket.off("time-up");
    };
  }, [quizCode, setCurrentQuestion, setState, setIsClosed, selectedOption, user.uid]);

  useEffect(() => {
    if (currentQuestion && user && participantQuiz.id ) {

      console.log("set submission --",{
        qid: currentQuestion.id,
        quizCode,
        quizId:participantQuiz.id,
        answer: selectedOption,
        uid: user.uid,
      } )
      setSubmission({
        qid: currentQuestion.id,
        quizCode,
        quizId:participantQuiz.id,
        answer: selectedOption,
        uid: user.uid,
      });
    }
  }, [currentQuestion, selectedOption, quizCode, user, participantQuiz.id]);

  
  if (isClosed) return <div>quiz has been closed</div>;

  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4">quiz Participant</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Current Question</Typography>

        {timeLeft !== null && (
          <Typography variant="h6" sx={{ mb: 2, color: "red" }}>
            Time Left: {timeLeft}s
          </Typography>
        )}

        {currentQuestion && state ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>{currentQuestion.text}</Typography>

            <List>
              {currentQuestion.options?.map((option: string, index: number) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton selected={selectedOption === index} onClick={() => { setSelectedOption(index); }}>
                    <ListItemText primary={option} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography variant="h6" sx={{ color: "gray" }}>Waiting for next question...</Typography>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5">Leaderboard</Typography>
          <List>
            {leaderboard?.map((player, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={`${player.email} - ${player.score} points`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Paper>
    </Box>
  );
};

export default ParticipantDashboard;
