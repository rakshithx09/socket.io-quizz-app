"use client"
import { useParams } from "next/navigation";

const QuizPage = () => {
  const { quizCode } = useParams(); 



  return (
    <div>
      {quizCode}
    </div>
  );
};

export default QuizPage;
