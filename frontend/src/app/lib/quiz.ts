
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { API_URL } from "../page";


/* handler for create quiz */
export const createQuiz = async (
  quizCode: string,
  router: AppRouterInstance,
  setQuiz
) => {
  try {
    const token = localStorage.getItem("token");

    /* endpoint to create quiz  
        input: access token in header,
               quizCode in body
    */
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
      setQuiz(data.quiz); /* stores data in state */
      router.push(`/quiz/${data.quiz.quizCode}`);  /* pushes browser window to quiz route in the client side */
      console.log("Quiz Created:", data.quiz);
    } else {
      console.error("Quiz creation failed:", data.message);
    }
  } catch (error) {
    console.error("Error creating quiz:", error);
  }
};


  export const joinQuiz = async (quizCode: string, router: AppRouterInstance,) => {
    try {
      /* fetches access token stored in local staorage */
      const token = localStorage.getItem("token");

      /* endpoint to create quiz  
        input: access token in header,
               quizCode in body
    */
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
        router.push(`/quiz/${data.quiz.quizCode}`);/* pushes browser window to quiz route in the client side */
        console.log("Joined Quiz:", data.quiz);
      } else {
        console.error("Failed to join quiz:", data.message);
      }
    } catch (error) {
      console.error("Error joining quiz:", error);
    }
  };