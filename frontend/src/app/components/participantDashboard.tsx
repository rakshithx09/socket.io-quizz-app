import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper, ListItemButton } from "@mui/material";
import useStore from "../store/quizStore";
import { getSocket } from "@/app/store/socketStore";

const ParticipantDashboard = ({ quizCode }: { quizCode: string }) => {
  const { currentQuestion, setCurrentQuestion, state, setState, resetStore ,isClosed,setIsClosed} = useStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket(quizCode, false);

    console.log("nxt-q event listener added");

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
      console.log("quiz-closed recieved")
      setIsClosed(true);
    });

    return () => {
      socket.off("next-question");
      socket.off("quiz-ended");
      socket.off("quiz-started");
    };
  }, [quizCode, setCurrentQuestion, setState, setIsClosed]);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const socket = getSocket(quizCode, false);
    socket.emit("submit-answer", { quizCode, answer: option });
  };
   console.log("isclosed : " , isClosed) 
  if (!state) {
    return <div>Quiz has been ended</div>;  
  }
  
   if(isClosed){
    return <div>Quiz has been closed</div>; 
  } 

  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4">Quiz Participant</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Current Question</Typography>

        {currentQuestion ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>{currentQuestion.text}</Typography>

            <List>
              {currentQuestion.options?.map((option: string, index: number) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton selected={selectedOption === option} onClick={() => handleAnswer(option)}>
                    <ListItemText primary={option} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography variant="h6" sx={{ color: "gray" }}>Waiting for next question...</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ParticipantDashboard;
