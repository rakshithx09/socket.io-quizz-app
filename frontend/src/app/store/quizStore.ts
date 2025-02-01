import { create } from "zustand";

const useStore = create((set) => ({
  score: 0,
  currentQuestion: null,
  socket: null,
  answers: [],
  quiz: null,
  state: false,
  participantQuiz: null,
  questions: [],
  activeIndex: 0,
  isHost:true,
  isClosed: false,
  setIsClosed : (isClosed) => set({ isClosed }),
  setState : (state) => set({ state }),
  setIsHost : (isHost) => set({ isHost }),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setScore: (score) => set({ score }),

  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),

  updateAnswers: (newAnswers) => set({ answers: newAnswers }),

  setSocket: (socket) => set({ socket }),

  setQuiz: (quiz) => set({ quiz }),
  setParticipantQuiz: (participantQuiz) => set({ participantQuiz }),

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
