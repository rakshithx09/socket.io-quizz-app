import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper, Button, ListItemButton } from "@mui/material";
import useStore from "../store/quizStore";
import { getSocket } from "@/app/store/socketStore";

const ParticipantDashboard = ({ quizCode }: { quizCode: string }) => {
  const { currentQuestion, setCurrentQuestion } = useStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Handle socket events
  useEffect(() => {
    const socket = getSocket(quizCode, false);

    console.log("nxt-q event lisener added");

    socket.on("next-question", (data) => {
      console.log("curr question recved from socket: ", data);
      setCurrentQuestion(data);
      setSelectedOption(null); 
    });

    return () => {
      socket.off("next-question");
    };
  }, [quizCode, setCurrentQuestion]);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    const socket = getSocket(quizCode, false);
    socket.emit("submit-answer", { quizCode, answer: option });
  };

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
