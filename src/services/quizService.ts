import axios from "axios";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

const API_URL = "https://hindutva-backend-jwh8.onrender.com/quizzes";

interface QuizData {
  title: string;
  description?: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    points?: number;
  }>;
  is_active?: boolean;
  category?: string;
  timeLimit?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // ✅ Changed from 'any'
}


// Helper function to get the current user's token
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  throw new Error("No user logged in");
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const quizService = {
  getAllQuizzes: async () => {
    try {
      // Get a fresh token directly
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching quizzes:", error);

      // Fallback to Firestore if API fails
      console.log("Falling back to Firestore for quizzes");
      try {
        const quizzesRef = collection(db, "quizzes");
        const querySnapshot = await getDocs(quizzesRef);
        const quizzes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return quizzes;
      } catch (fbError) {
        console.error("Firestore fallback failed:", fbError);
        return [];
      }
    }
  },

  getQuizById: async (id: string) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  getActiveQuizzes: async () => {
    try {
      console.log(
        "[QuizService] Fetching active quizzes directly from Firestore"
      );

      // Create a query against the quizzes collection where is_active is true
      const quizzesRef = collection(db, "quizzes");
      const activeQuizzesQuery = query(
        quizzesRef,
        where("is_active", "==", true)
      );

      // Execute the query
      const querySnapshot = await getDocs(activeQuizzesQuery);

      // Map the results to an array of quiz objects
      const activeQuizzes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("[QuizService] Fetched active quizzes:", activeQuizzes);
      return activeQuizzes;
    } catch (error) {
      console.error("[QuizService] Error fetching active quizzes:", error);
      throw error;
    }
  },

  // createQuiz: async (quizData: any) => {
  //   const response = await api.post('/add', quizData);
  //   return response.data;
  // },

  // updateQuiz: async (id: string, quizData: any) => {
  //   const response = await api.put(`/${id}`, quizData);
  //   return response.data;
  // },

  createQuiz: async (quizData: QuizData) => {
    const response = await api.post("/add", quizData);
    return response.data;
  },

  updateQuiz: async (id: string, quizData: QuizData) => {
    const response = await api.put(`/${id}`, quizData);
    return response.data;
  },

  deleteQuiz: async (id: string) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};
