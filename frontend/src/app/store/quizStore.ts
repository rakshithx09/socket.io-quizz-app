import {create} from 'zustand';

const useStore = create((set) => ({
  score: 0,
  currentQuestion: null,
  socket: null,
  answers: [],
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setScore: (score) => set({ score }),

  addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),

  setSocket: (socket) => set({ socket }),

  updateAnswers: (newAnswers) => set({ answers: newAnswers }),
}));

export default useStore;
