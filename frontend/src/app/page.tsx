"use client";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { createQuiz, joinQuiz } from "./lib/quiz";
import { useRouter } from "next/navigation";
import useStore from "./store/quizStore";
import Link from "next/link";
export const API_URL = "http://localhost:3001";


/* used to create random 6 digit numeric code */
const randomGenerator = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function Home() {
  const [quizCode, setQuizCode] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const { setQuiz } = useStore();
  useEffect(() => {
    setHydrated(true);  /* used to avoid hydration errors in client side rendering */
    setQuizCode(randomGenerator());
  }, []);

  const toggle = () => {
    setIsCreating((prev) => !prev); /* change between create and join quiz */
    setQuizCode(!isCreating ? randomGenerator() : "");
  };
  if (!hydrated) return null;

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
          {isCreating ? "create Quiz" : "join Quiz"}
        </Typography>

        <TextField
          label="quiz Code"
          variant="outlined"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
          fullWidth
          sx={{
            marginBottom: 2,
            backgroundColor: "white",
            borderRadius: "15px",
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
          {isCreating ? "join Quiz" : "create Quiz"}
        </p>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={isCreating ? () => createQuiz(quizCode, router, setQuiz) : () => joinQuiz(quizCode, router)}
        >
          {isCreating ? "start Quiz" : "join Quiz"}
        </Button>

        <Link href={"/auth"} className="underline">Sign-in/Sign-out</Link>
      </Box>
    </Container>
  );
}
