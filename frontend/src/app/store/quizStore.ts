import { create } from "zustand";

const useStore = create((set) => ({
  score: 0,
  currentQuestion: null,
  socket: null,
  answers: [],
  quiz: null,
  questions: [],
  activeIndex: 0,

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setScore: (score) => set({ score }),

  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),

  updateAnswers: (newAnswers) => set({ answers: newAnswers }),

  setSocket: (socket) => set({ socket }),

  setQuiz: (quiz) => set({ quiz }),

  setQuestions: (questions) => set({ questions }), 
  addQuestion: (question) =>
    set((state) => ({
      questions: [...state.questions, question],
    })),

  setActiveIndex: (index) => set({ activeIndex: index }), 

  resetStore: () =>
    set({
      score: 0,
      currentQuestion: null,
      socket: null,
      answers: [],
      quiz: null,
      questions: [],
      activeIndex: 0,
    }), 
}));

export default useStore;
