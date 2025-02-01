import { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Paper, Stack, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { getSocket } from "@/app/store/socketStore";
import useStore from "../store/quizStore";

interface QuestionFromDB {
  text: string;
  options: string[];
  correctAnswer: number;
  quizCode: string;
}

const HostDashboard = ({ quizCode }: { quizCode: string }) => {
  const { quiz, questions, setQuestions, state, setState, resetStore,isClosed,setIsClosed, leaderboard, setLeaderboard  } = useStore();
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [uncommittedQuestions, setUncommittedQuestions] = useState<QuestionFromDB[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const socket = getSocket(quizCode, true);

  useEffect(() => {
    socket.on("quiz-ended", () => {
      setState(false);
    });
    socket.on("quiz-started", () => {
      setState(true);
    });
    socket.on("quiz-closed", () => {
      setIsClosed(true);
    });

    socket.on("leaderboard-update", (newLeaderboard) => {
      console.log("new leaderboard   :::: ",newLeaderboard)
      setLeaderboard(newLeaderboard);
    });


    return () => {
      socket.off("next-question");
    };
  }, [socket, setState, setIsClosed]);

  const handleStartEndQuiz = () => {
    if (state) {
      socket.emit("end-quiz");
    } else {
      socket.emit("start-quiz");
    }
  };

  const handleCloseQuiz = () => {
    socket.emit("close-quiz");
  };

  console.log("leaderboard in root ::::", leaderboard)

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" align="center">Quiz Host Dashboard</Typography>

      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 2 }}>
        
      <Paper elevation={3} sx={{ p: 2, width: 250 }}>
          <Typography variant="h5">Leaderboard</Typography>
          <List>
            {leaderboard?.map((player, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={`${player.username} - ${player.score} points`} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: 250 }}>
          <Typography variant="h5">Active Question</Typography>
          <Typography variant="h6">{quiz.activeQuestion?.question || "No active question"}</Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, width: 250, textAlign: "center" }}>
  <Typography variant="h5">Quiz Controls</Typography>

  {isClosed ? (
    <Typography variant="h6" color="error" sx={{ mt: 2 }}>
      Quiz Closed
    </Typography>
  ) : (
    <>
      <Button
        variant="contained"
        color={state ? "error" : "success"}
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleStartEndQuiz}
      >
        {state ? "End Quiz" : "Start Quiz"}
      </Button>

      <Button variant="contained" color="secondary" fullWidth sx={{ mt: 2 }} onClick={handleCloseQuiz}>
        Close Quiz
      </Button>
    </>
  )}
</Paper>

        {/* Manage Questions Panel */}
        <Paper elevation={3} sx={{ p: 2, width: 250 }}>
          <Typography variant="h5">Manage Questions</Typography>
          {!showAddQuestion ? (
            <Button variant="contained" color="primary" fullWidth onClick={() => setShowAddQuestion(true)}>
              Add Question
            </Button>
          ) : (
            <>
              <TextField label="Enter Question" variant="outlined" fullWidth sx={{ my: 2 }} value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
              {newOptions.map((option, index) => (
                <TextField key={index} label={`Option ${index + 1}`} variant="outlined" fullWidth sx={{ my: 1 }} value={option} onChange={(e) => {
                  const updatedOptions = [...newOptions];
                  updatedOptions[index] = e.target.value;
                  setNewOptions(updatedOptions);
                }} />
              ))}

              <FormControl component="fieldset" sx={{ my: 2 }}>
                <FormLabel component="legend">Select Correct Answer</FormLabel>
                <RadioGroup value={correctAnswer.toString()} onChange={(e) => setCorrectAnswer(Number(e.target.value))}>
                  {newOptions.map((option, index) => (
                    <FormControlLabel key={index} value={index.toString()} control={<Radio />} label={`Option ${index + 1}`} />
                  ))}
                </RadioGroup>
              </FormControl>

              <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={() => {
                if (newQuestion.trim() && newOptions.every(opt => opt.trim())) {
                  setUncommittedQuestions([...uncommittedQuestions, { text: newQuestion, options: newOptions, correctAnswer, quizCode }]);
                  setNewQuestion("");
                  setNewOptions(["", "", "", ""]);
                  setCorrectAnswer(0);
                  setShowAddQuestion(false);
                } else {
                  alert("Please fill in all fields.");
                }
              }}>Save Question</Button>

              <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => setShowAddQuestion(false)}>Cancel</Button>
            </>
          )}

        
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h5">All Questions</Typography>
            <List>
              {[...questions, ...uncommittedQuestions].map((q, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={`${index + 1}. ${q.text}`} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {uncommittedQuestions.length > 0 && (
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={() => {
              if (uncommittedQuestions.length > 0) {
                socket.emit("submit-questions", uncommittedQuestions);
                setUncommittedQuestions([]);
              }
            }}>
              Submit All New Questions
            </Button>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default HostDashboard;
