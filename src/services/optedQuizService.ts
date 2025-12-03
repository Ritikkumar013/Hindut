import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const API_URL = 'https://hindutva-backend-jwh8.onrender.com/optedQuiz';

interface OptedQuizData {
  userId: string;
  quizId: string;
  registerDate: string;
  attemptDate?: string | Date;  // ✅ Allow both
  result?: number | null;
  quizAttempt?: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}



// Helper function to get the current user's token
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error('[OptedQuizService] No user logged in');
    throw new Error('No user logged in');
  }
  console.log('[OptedQuizService] Getting token for user:', user.uid);
  return await user.getIdToken();
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[OptedQuizService] Request config:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: 'Bearer [TOKEN]' // Log presence of token without exposing it
      }
    });
    return config;
  } catch (error) {
    console.error('[OptedQuizService] Error in request interceptor:', error);
    return Promise.reject(error);
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('[OptedQuizService] Response received:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('[OptedQuizService] API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

export const optedQuizService = {
  // Get all opted quizzes for the current user
  getOptedQuizzes: async (userId: string) => {
    try {
      console.log('[OptedQuizService] Fetching opted quizzes for user:', userId);
      const response = await api.get(`/user/${userId}`);
      console.log('[OptedQuizService] Fetched opted quizzes:', response.data);
      return response.data;
    } catch (error) {
      console.error('[OptedQuizService] Error fetching opted quizzes:', error);
      throw error;
    }
  },

  // Opt for a new quiz
  optForQuiz: async (quizData: {
    userId: string;
    quizId: string;
    registerDate: Date;
    result: number | null;
    quizAttempt: boolean;
    status: string;
  }) => {
    try {
      console.log('[OptedQuizService] Opting for quiz:', quizData);

      // Check if user has already registered for this quiz
      const optedQuizzesRef = collection(db, 'optedQuizzes');
      const q = query(
        optedQuizzesRef,
        where('userId', '==', quizData.userId),
        where('quizId', '==', quizData.quizId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('[OptedQuizService] User already registered for this quiz');
        // Instead of throwing an error, return the existing registration
        const existingRegistration = querySnapshot.docs[0].data();
        return {
          id: querySnapshot.docs[0].id,
          ...existingRegistration,
          alreadyRegistered: true // Flag to indicate this was an existing registration
        };
      }

      // Add new registration to optedQuizzes collection
      const docRef = await addDoc(collection(db, 'optedQuizzes'), {
        ...quizData,
        registerDate: quizData.registerDate.toISOString(),
        createdAt: new Date().toISOString()
      });

      console.log('[OptedQuizService] Successfully opted for quiz with ID:', docRef.id);
      return { id: docRef.id, ...quizData };
    } catch (error) {
      console.error('[OptedQuizService] Error opting for quiz:', error);
      throw error;
    }
  },

  // Update an opted quiz
  // updateOptedQuiz: async (id: string, quizData: any) => {
  //   try {
  //     console.log('[OptedQuizService] Updating opted quiz:', { id, quizData });

  //     // Convert Date objects to ISO strings for consistency
  //     const formattedData = { ...quizData };
  //     if (formattedData.attemptDate instanceof Date) {
  //       formattedData.attemptDate = formattedData.attemptDate.toISOString();
  //     }

  //     const response = await api.put(`/${id}`, formattedData);
  //     console.log('[OptedQuizService] Successfully updated opted quiz:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('[OptedQuizService] Error updating opted quiz:', error);
  //     throw error;
  //   }
  // },
 updateOptedQuiz: async (id: string, quizData: OptedQuizData) => {
  try {
    console.log('[OptedQuizService] Updating opted quiz:', { id, quizData });

    // Convert Date objects to ISO strings for consistency
    const formattedData = { ...quizData };
    if (formattedData.attemptDate instanceof Date) {
      formattedData.attemptDate = formattedData.attemptDate.toISOString();
    }

    const response = await api.put(`/${id}`, formattedData);
    console.log('[OptedQuizService] Successfully updated opted quiz:', response.data);
    return response.data;
  } catch (error) {
    console.error('[OptedQuizService] Error updating opted quiz:', error);
    throw error;
  }
},



  // Delete an opted quiz
  deleteOptedQuiz: async (id: string) => {
    try {
      console.log('[OptedQuizService] Deleting opted quiz:', id);
      const response = await api.delete(`/${id}`);
      console.log('[OptedQuizService] Successfully deleted opted quiz:', response.data);
      return response.data;
    } catch (error) {
      console.error('[OptedQuizService] Error deleting opted quiz:', error);
      throw error;
    }
  }
};