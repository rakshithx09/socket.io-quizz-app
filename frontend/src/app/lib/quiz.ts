
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { API_URL } from "../page";

export const createQuiz = async (quizCode: string, router: AppRouterInstance) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/create-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quizCode }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/quiz/${data.quiz.quizCode}`)
        console.log("Quiz Created:", data.quiz);
      } else {
        console.error("Quiz creation failed:", data.message);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };


  export const joinQuiz = async (quizCode: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/join-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quizCode }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Joined Quiz:", data.quiz);
      } else {
        console.error("Failed to join quiz:", data.message);
      }
    } catch (error) {
      console.error("Error joining quiz:", error);
    }
  };