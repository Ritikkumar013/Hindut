import React, { useEffect, useState } from 'react';
// import { Box, CircularProgress, Typography, Chip, Button } from '@mui/material';
// import { motion } from 'framer-motion';
import { Loader2, Search, Plus, Trophy, X } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { optedQuizService } from '@/services/optedQuizService';
import { useRouter } from 'next/navigation';

interface OptedQuiz {
  id: string;
  quizId: string;
  userId: string;
  attemptDate?: string;
  result?: number;
  status: string;
  quizAttempt?: boolean;
  quizDetails?: {
    title: string;
    description: string;
    is_active: boolean;
    startTime: string;
    endTime: string;
  };
}

function OptedQuizzes() {
  const [optedQuizzes, setOptedQuizzes] = useState<OptedQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch opted quizzes
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch opted quizzes using the service
        const optedQuizzesData = await optedQuizService.getOptedQuizzes(user.uid);

        // Fetch quiz details for each opted quiz
        const quizzesWithDetails = await Promise.all(
          optedQuizzesData.map(async (quiz: OptedQuiz) => {
            const quizDoc = await getDoc(doc(db, 'quizzes', quiz.quizId));
              if (quizDoc.exists()) {
              return {
                ...quiz,
                quizDetails: quizDoc.data()
              };
            }
            return quiz;
          })
        );

        setOptedQuizzes(quizzesWithDetails);
          setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleRegisterForQuiz = () => {
    if (!user) {
      toast.error('Please login to register for a quiz');
      return;
    }

    // Redirect to register quiz page
    router.push('/registerquiz');
  };

  // Filter quizzes based on search term
  const filteredQuizzes = optedQuizzes.filter(quiz =>
    quiz.quizDetails?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determine if a quiz was attempted and if it was a win
  const getQuizResult = (quiz: OptedQuiz) => {
    if (!quiz.result && quiz.result !== 0) return null;
    return quiz.result > 75 ? 'Win' : 'Lose';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          <p className="text-orange-700 font-medium">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-800">My Quizzes</h1>
          <p className="text-orange-600 mt-1">View your registered quizzes and results</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-orange-800 mb-4">Your Registered Quizzes</h2>

          {optedQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-orange-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-orange-800">No quizzes registered yet</h3>
              <p className="text-orange-600 mt-1 mb-6">You haven&apos;t registered for any quizzes</p>

              <button
                onClick={handleRegisterForQuiz}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors mx-auto"
              >
                <Plus size={18} />
                <span>Register for Quiz</span>
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-orange-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search your quizzes..."
                    className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredQuizzes.map((quiz) => {
                  const quizResult = getQuizResult(quiz);
                  const isAttempted = quiz.quizAttempt || (quiz.result !== undefined && quiz.result !== null);
                  const startDate = quiz.quizDetails?.startTime ? new Date(quiz.quizDetails.startTime) : null;
                  const endDate = quiz.quizDetails?.endTime ? new Date(quiz.quizDetails.endTime) : null;
                  const now = new Date();
                  const isLaunched = startDate ? startDate <= now : false;
                  const isEnded = endDate ? endDate <= now : false;

                  return (
                    <div
                      key={quiz.id}
                      className={`p-4 border-2 ${isAttempted ? (quizResult === 'Win' ? 'border-green-200' : 'border-red-200') : 'border-orange-200'} rounded-lg hover:border-opacity-80 transition-colors`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-orange-800">
                            {quiz.quizDetails?.title || 'Quiz Title Not Available'}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {isAttempted ? (
                              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${quizResult === 'Win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {quizResult === 'Win' ? <Trophy size={14} /> : <X size={14} />}
                                {quizResult}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                Not Attempted
                              </div>
                            )}

                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {quiz.status}
                            </div>
                          </div>

                          {isAttempted && (
                            <>
                              <p className="text-sm text-orange-600 mt-2">
                                Result: {quiz.result !== undefined && quiz.result !== null ? `${quiz.result}%` : 'Not Available'}
                              </p>
                              <p className="text-xs text-orange-500 mt-2">
                                {quiz.attemptDate && quiz.attemptDate !== 'Invalid Date' ? (
                                  <>Attempt Date: {new Date(quiz.attemptDate).toLocaleString()}</>
                                ) : (
                                  <>Attempt Date: Not Available</>
                                )}
                              </p>
                            </>
                          )}

                          {!isAttempted && (
                            <p className="text-xs text-orange-500 mt-2">
                              {quiz.quizDetails?.startTime && (
                                <>Start: {new Date(quiz.quizDetails.startTime).toLocaleString()}<br /></>
                              )}
                              {quiz.quizDetails?.endTime && (
                                <>End: {new Date(quiz.quizDetails.endTime).toLocaleString()}</>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {!isAttempted && isLaunched && !isEnded && (
                            <a
                              href={`/quiz?id=${quiz.quizId}`}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              Attempt Quiz
                            </a>
                          )}

                          {isAttempted && (
                            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm text-center">
                              Already Attempted
                            </div>
                          )}

                          {!isLaunched && (
                            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm text-center">
                              Coming Soon
                        </div>
                          )}

                          {isEnded && !isAttempted && (
                            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm text-center">
                              Quiz Ended
                        </div>
                          )}
                        </div>
                          </div>
                          </div>
                  );
                })}
                          </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleRegisterForQuiz}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  <span>Register for More Quizzes</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OptedQuizzes; 