import React, { useEffect, useState, useCallback } from 'react';
import { Chip } from '@mui/material';
import QuizDetail from './QuizzesDetail';
import { ChevronLeft, Eye, Plus, Search, Loader2, Edit, Trash2, X } from 'lucide-react';
import CreateQuiz from './CreateQuiz';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  category: string;
  createdAt?: { _seconds: number; _nanoseconds: number } | Date | string;
  updatedAt?: { _seconds: number; _nanoseconds: number } | Date | string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  startTime: string;
  endTime: string;
  questions_list: Question[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface QuizForEdit {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  startTime: string;
  endTime: string;
  questions_list: Question[];
  createdAt: Date;
  updatedAt: Date;
}

function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 10;
  // const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  // const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<QuizForEdit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [isSelectQuestionModalOpen, setIsSelectQuestionModalOpen] = useState(false);
  const [questionsPerPage] = useState(5);
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);

  const setupQuizzes = useCallback(async () => {
    try {
      // Create a query with ordering
      const quizzesQuery = query(
        collection(db, 'quizzes'),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listener with caching
      const unsubscribe = onSnapshot(
        quizzesQuery,
        (snapshot) => {
          const fetchedQuizzes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Quiz[];
          
          console.log('Fetched quizzes:', fetchedQuizzes.length);
          setQuizzes(fetchedQuizzes);
          setFilteredQuizzes(fetchedQuizzes);
          setLoading(false);
        },
        (error) => {
          console.error('Snapshot error:', error);
          setError('Failed to load quizzes');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error in setupQuizzes:', error);
      setError('Failed to load quizzes');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setupQuizzes();
  }, [setupQuizzes]);

  useEffect(() => {
    const filtered = quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuizzes(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, quizzes]);

  const handleSort = useCallback(() => {
    setFilteredQuizzes(prev => {
      const sorted = [...prev].sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
      return sorted;
    });
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, [sortOrder]);

  const handleQuizClick = useCallback((quizId: string) => {
    setSelectedQuizId(quizId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedQuizId(null);
  }, []);

  const handleCreateQuiz = useCallback(() => {
    setIsCreatingQuiz(true);
  }, []);

  const handleCancelCreateQuiz = useCallback(() => {
    setIsCreatingQuiz(false);
  }, []);

  const handleEditQuiz = useCallback((quiz: Quiz) => {
    // Convert Firestore timestamp to Date
    const startDate = new Date(quiz.createdAt._seconds * 1000);
    const quizForEdit: QuizForEdit = {
      ...quiz,
      endTime: quiz.endTime || new Date(startDate.getTime() + 60 * 60 * 1000).toISOString(), // Default to 1 hour after start if not provided
      createdAt: startDate,
      updatedAt: new Date(quiz.updatedAt._seconds * 1000)
    };
    setSelectedQuizId(quiz.id);
    setIsEditingQuiz(true);
    setQuizToEdit(quizForEdit);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setSelectedQuizId(null);
    setIsEditingQuiz(false);
  }, []);

  const handleDeleteQuiz = useCallback(async (quizId: string) => {
    toast.warn(
      <div className="p-4">
        <p className="font-semibold text-orange-800">Are you sure you want to delete this quiz?</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => confirmDeleteQuiz(quizId)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: "bg-white rounded-xl shadow-lg border-2 border-orange-200",
      }
    );
  }, []);

  const confirmDeleteQuiz = useCallback(async (quizId: string) => {
    toast.dismiss();
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'quizzes', quizId));
      toast.success("Quiz deleted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  }, [toast]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
  const startIndex = (currentPage - 1) * quizzesPerPage;
  const endIndex = startIndex + quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(startIndex, endIndex);

  // const handleSelectQuestions = () => {
  //   setIsSelectQuestionModalOpen(true);
  //   fetchQuestions();
  // };

  // const fetchQuestions = async () => {
  //   try {
  //     const questionsRef = collection(db, 'questions');
  //     const q = query(questionsRef, orderBy('createdAt', 'desc'));
  //     const querySnapshot = await getDocs(q);
  //     const fetchedQuestions = querySnapshot.docs.map(doc => ({
  //       id: doc.id,
  //       questionText: doc.data().text || doc.data().questionText || '',
  //       options: doc.data().options || [],
  //       correctAnswer: doc.data().correctAnswer || '',
  //       category: doc.data().category || '',
  //       createdAt: doc.data().createdAt,
  //       updatedAt: doc.data().updatedAt
  //     })) as Question[];
  //     setQuestions(fetchedQuestions);
  //   } catch (error) {
  //     console.error('Error fetching questions:', error);
  //     toast.error('Failed to fetch questions');
  //   }
  // };

  // Calculate pagination for questions
  const indexOfLastQuestion = currentQuestionPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalQuestionPages = Math.ceil(questions.length / questionsPerPage);

  const handleQuestionPageChange = (pageNumber: number) => {
    setCurrentQuestionPage(pageNumber);
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-orange-800">Quiz Management</h1>
          <p className="text-orange-600 mt-1">Manage and organize your quizzes</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => {
                      // Reload quizzes
                      setupQuizzes();
                    }}
                    className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
      ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-orange-800">No quizzes available</h3>
              <p className="text-orange-600 mt-1">Create your first quiz to get started</p>
              <button
                onClick={handleCreateQuiz}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Create First Quiz
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!selectedQuizId && !isCreatingQuiz ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handleCreateQuiz}
                      className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg'
                    >
                      <Plus size={20} />
                      <span>Create Quiz</span>
                    </button>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors w-64"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" size={20} />
                    </div>
                  </div>

                  <div className="overflow-x-auto border-2 border-orange-200 rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-orange-200">
                      <thead className="bg-orange-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                            #
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors"
                            onClick={handleSort}
                          >
                            Title {sortOrder === 'asc' ? '↑' : '↓'}
                      </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                            Description
                      </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                            Questions
                      </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                            Status
                      </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-orange-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                      <tbody className="bg-white divide-y divide-orange-200">
                        {currentQuizzes.map((quiz, index) => (
                          <motion.tr
                        key={quiz.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-orange-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-orange-900">{startIndex + index + 1}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-orange-900">{quiz.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-orange-700">{quiz.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-orange-700">{quiz.questions_list.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Chip
                                label={quiz.is_active ? "Active" : "Inactive"}
                                color={quiz.is_active ? "success" : "default"}
                            size="small"
                                sx={{
                                  backgroundColor: quiz.is_active ? '#22c55e' : '#e5e7eb',
                                  color: quiz.is_active ? 'white' : '#374151',
                                }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleQuizClick(quiz.id)}
                                  className="text-orange-600 hover:text-orange-700 transition-colors p-2 hover:bg-orange-100 rounded-full"
                              title="View quiz details"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                                  onClick={() => handleEditQuiz(quiz)}
                                  className="text-orange-600 hover:text-orange-700 transition-colors p-2 hover:bg-orange-100 rounded-full"
                              title="Edit quiz"
                            >
                              <Edit size={20} />
                            </button>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-100 rounded-full"
                                  title="Delete quiz"
                                >
                                  <Trash2 size={20} />
                                </button>
                          </div>
                        </td>
                          </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
                </motion.div>
          ) : isCreatingQuiz ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
              <button
                onClick={handleCancelCreateQuiz}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg mb-4 flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
                  >
                    <ChevronLeft size={20} />
                    <span>Back to Quizzes</span>
                  </button>

                  <CreateQuiz onQuizCreated={() => {
                    setupQuizzes();
                    setIsCreatingQuiz(false);
                  }} />
                </motion.div>
              ) : isEditingQuiz ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={handleCancelEdit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg mb-4 flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
              >
                <ChevronLeft size={20} />
                <span>Back to Quizzes</span>
              </button>

                  {quizToEdit && (
                    <CreateQuiz 
                      quizToEdit={{
                        id: quizToEdit.id,
                        title: quizToEdit.title,
                        description: quizToEdit.description,
                        is_active: quizToEdit.is_active,
                        questions_list: quizToEdit.questions_list.map(q => ({
                          id: q.id,
                          text: q.questionText,
                          options: q.options,
                          correctAnswer: q.correctAnswer,
                          category: q.category
                        })),
                        startTime: quizToEdit.startTime,
                        endTime: quizToEdit.startTime, // Using same as startTime temporarily
                        createdAt: quizToEdit.createdAt,
                        updatedAt: quizToEdit.updatedAt
                      }}
                      onQuizCreated={() => {
                        setupQuizzes();
                        setIsEditingQuiz(false);
                      }} 
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
              <button
                onClick={handleBack}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg mb-4 flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
              >
                <ChevronLeft size={20} />
                <span>Back to Quizzes</span>
              </button>

              {selectedQuizId && (
                <QuizDetail 
                  quizId={selectedQuizId} 
                  onClose={() => setSelectedQuizId(null)} 
                />
              )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Add pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border-2 border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-orange-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border-2 border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Select Question Modal */}
      {isSelectQuestionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-800">Select Questions</h2>
              <button
                onClick={() => setIsSelectQuestionModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full p-2 border border-gray-300 rounded-lg"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = questions.filter(q => 
                    q.questionText.toLowerCase().includes(searchTerm)
                  );
                  setQuestions(filtered);
                }}
              />
            </div>

            <div className="space-y-4">
              {currentQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 border rounded-lg ${
                    selectedQuestions.some(q => q.id === question.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{question.questionText}</p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Category: {question.category}</p>
                        <p className="text-sm text-gray-600">Correct Answer: {question.correctAnswer}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedQuestions(prev => {
                          if (prev.some(q => q.id === question.id)) {
                            return prev.filter(q => q.id !== question.id);
                          } else {
                            return [...prev, question];
                          }
                        });
                      }}
                      className={`ml-4 px-3 py-1 rounded-lg ${
                        selectedQuestions.some(q => q.id === question.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedQuestions.some(q => q.id === question.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Question Pagination */}
            {totalQuestionPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => handleQuestionPageChange(currentQuestionPage - 1)}
                  disabled={currentQuestionPage === 1}
                  className="px-3 py-1 border-2 border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-orange-600">
                  Page {currentQuestionPage} of {totalQuestionPages}
                </span>
                <button
                  onClick={() => handleQuestionPageChange(currentQuestionPage + 1)}
                  disabled={currentQuestionPage === totalQuestionPages}
                  className="px-3 py-1 border-2 border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsSelectQuestionModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setQuizToEdit(prev => ({
                    ...prev!,
                    questions_list: selectedQuestions
                  }));
                  setIsSelectQuestionModalOpen(false);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizList;