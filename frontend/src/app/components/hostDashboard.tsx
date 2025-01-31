import { useState } from "react";
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Paper, Stack, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import { getSocket } from "@/app/store/socketStore";
import useStore from "../store/quizStore";

const HostDashboard = ({ quizCode }: { quizCode: string }) => {
  const { quiz, questions, addQuestion , setQuestions} = useStore();
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const socket = getSocket(quizCode);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const handleCorrectAnswerChange = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setCorrectAnswer(Number(value));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() && newOptions.every(opt => opt.trim())) {
      const newQ = { text: newQuestion, options: newOptions, correctAnswer , quizCode}; 
      console.log("newQ :: " ,newQ)
      addQuestion(newQ);

      /* socket.emit("send-question", newQ);
       */
      setNewQuestion("");
      setNewOptions(["", "", "", ""]);
      setCorrectAnswer(0); 
      setShowAddQuestion(false);

    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleStartEndQuiz = () => {
    if (quizStarted) {
      socket.emit("end-quiz");
    } else {
      socket.emit("start-quiz");
    }
    setQuizStarted(!quizStarted);
  };

  const handlePauseContinue = () => {
    if (isPaused) {
      socket.emit("continue-quiz");
    } else {
      socket.emit("pause-quiz");
    }
    setIsPaused(!isPaused);
  };

  const handleSubmitQuestions = () => {
    
    console.log("before submit")
    
   socket.emit("submit-questions", questions);
    console.log("question ::  " , questions)
    setQuestions([])
  };
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" align="center">Quiz Host Dashboard</Typography>

      <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 2 }}>
        
        <Paper elevation={3} sx={{ p: 2, width: 250 }}>
          <Typography variant="h5">Leaderboard</Typography>
          <List>
            {quiz.leaderboard?.map((player, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={`${player.name} - ${player.score} points`} />
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
          <Button variant="contained" color={quizStarted ? "error" : "success"} fullWidth sx={{ mt: 2 }} onClick={handleStartEndQuiz}>
            {quizStarted ? "End Quiz" : "Start Quiz"}
          </Button>
          {quizStarted && (
            <Button variant="contained" color={isPaused ? "primary" : "warning"} fullWidth sx={{ mt: 2 }} onClick={handlePauseContinue}>
              {isPaused ? "Continue Quiz" : "Pause Quiz"}
            </Button>
          )}
        </Paper>

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
                <TextField key={index} label={`Option ${index + 1}`} variant="outlined" fullWidth sx={{ my: 1 }} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} />
              ))}

              <FormControl component="fieldset" sx={{ my: 2 }}>
                <FormLabel component="legend">Select Correct Answer</FormLabel>
                <RadioGroup value={correctAnswer.toString()} onChange={handleCorrectAnswerChange}>
                  {newOptions.map((option, index) => (
                    <FormControlLabel key={index} value={index.toString()} control={<Radio />} label={`Option ${index + 1}`} />
                  ))}
                </RadioGroup>
              </FormControl>

              <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleAddQuestion}>Save Question</Button>
              <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => setShowAddQuestion(false)}>Cancel</Button>
            </>
          )}
          {questions && questions.length > 0 && (
            <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
              <Typography variant="h5">Added Questions</Typography>
              <List>
                {questions.map((q, index) => (
                  <ListItem key={index} divider>
                    <ListItemText primary={`${index + 1}. ${q.text}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
          {questions && questions.length > 0 && (
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSubmitQuestions}>
              Submit All Questions
            </Button>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default HostDashboard;
