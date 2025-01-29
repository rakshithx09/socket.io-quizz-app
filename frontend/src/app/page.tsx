"use client"

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useStore from "./store/quizStore";
import { io } from "socket.io-client";

const fetchData = async (setResponse: Dispatch<SetStateAction<string>>) => {
  const response = await fetch("http://localhost:3001/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  });
  const data = await response.json();
  setResponse(JSON.stringify(data));
}

export default function Home() {
  const [quizCode, setQuizCode] = useState("");
  const [customCode, setCustomCode] = useState('');
  const [isCreating, setIsCreating] = useState(true);

  const { socket, setSocket } = useStore();

  const randomGenerator = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const toggle = () => {
    setIsCreating((prev)=>  !prev);
    if(isCreating){
      setQuizCode(randomGenerator());
    }
    
  };

  const enterQuiz = (quizCode) => {
    if (!socket) {
      console.log("before connect")
      const socket = io(`ws://localhost:3003?quizCode=${quizCode}`);
      setSocket(socket);
    }
  }

  const inputHandler = (e) => {
    setQuizCode(e.target.value);
  };

  useEffect(() => {
    /* fetchData(setResponse);  */
    setQuizCode(randomGenerator())
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket])

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
          backgroundColor: "black",
        }}
      >
        <Typography variant="h4" gutterBottom>
          {isCreating ? "Create Quiz" : "Join Quiz"}
        </Typography>

        <TextField
          label="Quiz Code"
          variant="outlined"
          value={isCreating ? quizCode : customCode}
          onChange={inputHandler}
          fullWidth
          /* disabled={isCreating ? false : true}  */
          sx={{
            marginBottom: 2,
            backgroundColor: "white",
            borderRadius: "15px"
          }}
        />

        <p
          onClick={toggle}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            fontStyle: "italic",
          }}
        >
          {isCreating ? "Join Quiz" : "Create Quiz"}
        </p>


        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() =>{console.log("quiz code: ", quizCode); enterQuiz(quizCode); return;}}
        >
          {isCreating ? "Start Quiz" : "Join Quiz"}
        </Button>
      </Box>
    </Container>
  );
}
