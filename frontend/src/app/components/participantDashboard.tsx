import { useState } from "react";
import { Box, Typography, List, ListItem, ListItemText, Paper, Button } from "@mui/material";
import useStore from "../store/quizStore";
import { getSocket } from "@/app/store/socketStore";

const ParticipantDashboard = ({quizCode} : {quizCode : string}) => {
  const { quiz, questions } = useStore();
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    const socket = getSocket(quizCode);
    socket.emit("submit-answer", { quizCode: quiz.quizCode, answer: option });
  };

  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4">Quiz Participant</Typography>

      {/* Active Question */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5">Current Question</Typography>
        <Typography variant="h6">{quiz.activeQuestion?.question || "Waiting for next question..."}</Typography>
        <List>
          {quiz.activeQuestion?.options?.map((option, index) => (
            <ListItem key={index} button selected={selectedOption === option} onClick={() => handleAnswer(option)}>
              <ListItemText primary={option} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Leaderboard */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5">Leaderboard</Typography>
        <List>
          {quiz.leaderboard?.map((player, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={`${player.name} - ${player.score} points`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {
        JSON.stringify(questions)
      }
    </Box>
  );
};

export default ParticipantDashboard;
