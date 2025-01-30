import { useState } from "react";
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Paper } from "@mui/material";
import { getSocket } from "@/app/store/socketStore";
import useStore from "../store/quizStore";

const HostDashboard = ({quizCode} : {quizCode : string}) => {
  const { quiz } = useStore();
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() && newOptions.every(opt => opt.trim())) {
      const socket = getSocket(quizCode);
      socket.emit("send-question", { question: newQuestion, options: newOptions });
      setNewQuestion("");
      setNewOptions(["", "", "", ""]);
      setShowAddQuestion(false);
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4">Quiz Host Dashboard</Typography>

      {/* Leaderboard Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5">Leaderboard</Typography>
        <List>
          {quiz.leaderboard?.map((player, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={`${player.name} - ${player.score} points`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Active Question */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5">Active Question</Typography>
        <Typography variant="h6">{quiz.activeQuestion?.question || "No active question"}</Typography>
      </Paper>

      {/* Add Question Section */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5">Manage Questions</Typography>
        {!showAddQuestion ? (
          <Button variant="contained" color="primary" fullWidth onClick={() => setShowAddQuestion(true)}>
            Add Question
          </Button>
        ) : (
          <>
            <TextField label="Enter Question" variant="outlined" fullWidth sx={{ my: 2 }} value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
            {newOptions.map((option, index) => (
              <TextField key={index} label={`Option ${index + 1}`} variant="outlined" fullWidth sx={{ my: 1 }} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} />
            ))}
            <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleAddQuestion}>Save Question</Button>
            <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => setShowAddQuestion(false)}>Cancel</Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default HostDashboard;
