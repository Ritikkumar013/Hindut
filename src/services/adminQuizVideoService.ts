import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = 'https://hindutva-backend-jwh8.onrender.com/admin-quiz-videos';

// Helper function to get the current user's token
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  throw new Error('No user logged in');
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
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

export interface QuizVideo {
  id: string;
  quizId: string;
  quizTitle: string;
  videoUrl: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt?: string;
  status: string;
  contentType: string;
}

export const adminQuizVideoService = {
  // Get all quiz videos
  getAllQuizVideos: async (): Promise<QuizVideo[]> => {
    try {
      // Get a fresh token directly
      const token = await getAuthToken();
      const response = await axios.get(`${API_URL}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz videos:', error);
      return [];
    }
  },

  // Get a specific quiz video
  getQuizVideoById: async (quizId: string): Promise<QuizVideo | null> => {
    try {
      const response = await api.get(`/${quizId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Upload a new quiz video
  uploadQuizVideo: async (quizId: string, videoFile: File): Promise<{ videoUrl: string; quizId: string }> => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('quizId', quizId);

      // Get a fresh token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Force token refresh to ensure we have the latest token
      await auth.currentUser?.getIdToken(true);
      const token = await user.getIdToken();

      console.log('Uploading video with token:', token.substring(0, 10) + '...');

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading quiz video:', error);
      throw error;
    }
  },

  // Update a quiz video
  updateQuizVideo: async (quizId: string, videoFile: File): Promise<{ videoUrl: string; quizId: string }> => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      // Get a fresh token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Force token refresh to ensure we have the latest token
      await auth.currentUser?.getIdToken(true);
      const token = await user.getIdToken();

      console.log('Updating video with token:', token.substring(0, 10) + '...');

      const response = await axios.put(`${API_URL}/${quizId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating quiz video:', error);
      throw error;
    }
  },

  // Delete a quiz video
  deleteQuizVideo: async (quizId: string): Promise<{ quizId: string }> => {
    try {
      // Get a fresh token
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Force token refresh to ensure we have the latest token
      await auth.currentUser?.getIdToken(true);
      const token = await user.getIdToken();

      console.log('Deleting video with token:', token.substring(0, 10) + '...');

      const response = await axios.delete(`${API_URL}/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting quiz video:', error);
      throw error;
    }
  }
};
