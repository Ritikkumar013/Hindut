import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Types for question-related data
interface QuestionOption {
  questionId: string;
  questionText: string;
  options: string[];
}

interface QuestionAnswer {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  correctOption: number;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  quizId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hindutva-backend-jwh8.onrender.com';

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
  baseURL: `${API_URL}/questions`,
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

class QuestionService {
  // Fetch questions for a specific quiz
  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    try {
      console.log(`[QuestionService] Fetching questions for quiz ${quizId}`);
      const response = await api.get(`/quiz/${quizId}/questions`);
      
      if (!response.data) {
        console.error('[QuestionService] No data received from API');
        return [];
      }

      if (!Array.isArray(response.data)) {
        console.error('[QuestionService] API response is not an array:', response.data);
        return [];
      }

      // Validate each question
      const validQuestions = response.data.filter(question => {
        if (!question || typeof question !== 'object') {
          console.warn('[QuestionService] Invalid question object:', question);
          return false;
        }

        if (!question.id || !question.questionText || !Array.isArray(question.options)) {
          console.warn('[QuestionService] Question missing required fields:', question);
          return false;
        }

        return true;
      });

      console.log(`[QuestionService] Successfully fetched ${validQuestions.length} valid questions`);
      return validQuestions;
    } catch (error) {
      console.error('[QuestionService] Error fetching questions:', error);
      throw error;
    }
  }

  // Fetch question text and options only
  async getQuestionTextAndOptions(): Promise<QuestionOption[]> {
    try {
      const response = await api.get('/questions-text-options');
      return response.data;
    } catch (error) {
      console.error('[QuestionService] Error fetching question options:', error);
      throw error;
    }
  }

  // Fetch correct answers
  async getCorrectAnswers(): Promise<QuestionAnswer[]> {
    try {
      const response = await api.get('/correct-answers');
      return response.data;
    } catch (error) {
      console.error('[QuestionService] Error fetching correct answers:', error);
      throw error;
    }
  }

  // Add a new question
  async addQuestion(questionData: Partial<Question>): Promise<Question> {
    try {
      const response = await api.post('/addquestion', questionData);
      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  // Update a question
  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question> {
    try {
      const response = await api.put(`/${id}`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  // Delete a question
  async deleteQuestion(id: string): Promise<void> {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Combine questions and answers for a quiz
  async getQuestionsWithAnswers(quizId: string): Promise<Question[]> {
    try {
      console.log(`[QuestionService] Fetching questions with answers for quiz ${quizId}`);
      const questions = await this.getQuestionsByQuizId(quizId);
      
      if (!questions.length) {
        console.log(`[QuestionService] No questions found for quiz ${quizId}`);
        return [];
      }

      const correctAnswers = await this.getCorrectAnswers();
      console.log(`[QuestionService] Fetched ${correctAnswers.length} correct answers`);

      const questionsWithAnswers = questions.map(question => {
        const answerData = correctAnswers.find(answer => answer.questionId === question.id);
        if (!answerData) {
          console.warn(`[QuestionService] No answer found for question ${question.id}`);
        }
        return {
          ...question,
          correctAnswer: answerData?.correctAnswer || '',
          correctOption: answerData?.correctOption || -1
        };
      });

      console.log(`[QuestionService] Successfully combined ${questionsWithAnswers.length} questions with their answers`);
      return questionsWithAnswers;
    } catch (error) {
      console.error('[QuestionService] Error fetching questions with answers:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const questionService = new QuestionService();
