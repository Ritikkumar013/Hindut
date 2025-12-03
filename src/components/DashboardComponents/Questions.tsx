import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function QuizScreen() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  // const [selectedAnswers, setSelectedAnswers] = useState<{
  //   [key: string]: string;
  // }>({});
  // const [feedback, setFeedback] = useState<{ [key: string]: boolean | null }>(
  //   {}
  // );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    category: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const setupQuestions = useCallback(async () => {
    try {
      const questionsQuery = query(
        collection(db, 'questions'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        questionsQuery,
        (snapshot) => {
          const fetchedQuestions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Question[];
          
          setQuestions(fetchedQuestions);
          setIsLoading(false);
        },
        (error) => {
          console.error('Snapshot error:', error);
          setError('Failed to load questions');
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error in setupQuestions:', error);
      setError('Failed to load questions');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setupQuestions();
  }, [setupQuestions]);

  // const handleAnswerClick = (
  //   questionId: string,
  //   option: string,
  //   correctAnswer: string
  // ) => {
  //   setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  //   setFeedback((prev) => ({
  //     ...prev,
  //     [questionId]: option === correctAnswer,
  //   }));
  // };

  
  const handleDeleteQuestion = async (questionId: string) => {
    toast.info(
      <div className="flex flex-col">
        <span>Are you sure you want to delete this question?</span>
        <div className="flex gap-2 mt-2">
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-md"
            onClick={async () => {
              try {
                await deleteDoc(doc(db, 'questions', questionId));
                toast.success("Question deleted successfully!");
              } catch (error) {
                console.error("Error deleting question:", error);
                toast.error("Failed to delete the question. Please try again.");
              }
            }}
          >
            Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded-md"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        closeOnClick: true,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const openModal = (question: Question) => {
    setCurrentQuestion(question);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentQuestion(null);
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion({
      ...question,
      options: [...question.options],
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingQuestion) return;

    if (!editingQuestion.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (editingQuestion.options.some((option) => !option.trim())) {
      setError("All options must be filled");
      return;
    }

    if (!editingQuestion.correctAnswer.trim()) {
      setError("Correct answer is required");
      return;
    }

    if (!editingQuestion.options.includes(editingQuestion.correctAnswer)) {
      setError("Correct answer must be one of the options");
      return;
    }

    try {
      setIsLoading(true);
      
      await updateDoc(doc(db, 'questions', editingQuestion.id), {
        questionText: editingQuestion.questionText,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        category: editingQuestion.category,
        updatedAt: new Date()
      });

      toast.success("Question updated successfully!");
      setEditModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.questionText.trim()) {
      setError("Question text is required");
      return;
    }

    if (newQuestion.options.some((option) => !option.trim())) {
      setError("All options must be filled");
      return;
    }

    if (!newQuestion.correctAnswer.trim()) {
      setError("Correct answer is required");
      return;
    }

    if (!newQuestion.options.includes(newQuestion.correctAnswer)) {
      setError("Correct answer must be one of the options");
      return;
    }

    try {
      setIsLoading(true);
      
      await addDoc(collection(db, 'questions'), {
        ...newQuestion,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setNewQuestion({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        category: ""
      });
      setError("");
      toast.success('Question added successfully!');
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to add question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-800 text-center">
            Interactive Quiz Creator
          </h1>
          <p className="text-center text-orange-600 mt-2">
            Create and test your knowledge with custom quizzes
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Question List Section */}
          <div className="lg:w-2/3 w-full">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-orange-800">
                  Question Bank
                </h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {questions.length} Questions
                </span>
              </div>

              {isLoading && questions.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : error && questions.length === 0 ? (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center">
                  {error}
                </div>
              ) : questions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-1">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="bg-white border border-orange-200 hover:border-orange-400 rounded-lg shadow-sm hover:shadow-md transition-all p-4 flex justify-between items-center"
                    >
                      <div
                        onClick={() => openModal(question)}
                        className="cursor-pointer flex-1"
                      >
                        <div className="flex items-start mb-2">
                          <span className="flex-shrink-0 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          <h3 className="font-medium text-orange-900">
                            {question.questionText}
                          </h3>
                        </div>
                        <div className="mt-2 text-sm text-orange-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Answer:{" "}
                          <span className="font-medium text-orange-700 ml-1">
                            {question.correctAnswer}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEditClick(question)}
                        className="flex items-center space-x-1 bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1.5 rounded-lg transition-all duration-200 group mx-2"
                      >
                        <svg
                          className="w-4 h-4 group-hover:scale-110 transition-transform"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M3 17.25V21h3.75l9.854-9.854-3.75-3.75L3 17.25zm13.396-8.774l2.428-2.428a2.5 2.5 0 10-3.536-3.536l-2.428 2.428 3.536 3.536z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg transition-all duration-200 group"
                      >
                        <svg
                          className="w-4 h-4 group-hover:scale-110 transition-transform"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-orange-500 py-8">
                  No questions available. Create your first question!
                </p>
              )}
            </div>
          </div>

          {/* Create Question Form */}
          <div className="lg:w-1/3 w-full">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">
                Create New Question
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your question here"
                    className="w-full p-2 border border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-md shadow-sm"
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        questionText: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center mr-2 text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 p-2 border border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-md shadow-sm"
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...newQuestion.options];
                            updatedOptions[index] = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              options: updatedOptions,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    className="w-full p-2 border border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-md shadow-sm bg-white"
                    value={newQuestion.correctAnswer}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        correctAnswer: e.target.value,
                      })
                    }
                  >
                    <option value="">Select correct answer</option>
                    {newQuestion.options.map(
                      (option, index) =>
                        option && (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        )
                    )}
                  </select>
                </div>

                <button
                  className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center justify-center"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Create Question"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {modalOpen && currentQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-orange-800">
                  Question{" "}
                  {questions.findIndex((q) => q.id === currentQuestion.id) + 1}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-orange-400 hover:text-orange-600 focus:outline-none"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-orange-900 mb-6 font-medium">
                {currentQuestion.questionText}
              </p>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`w-full p-3 rounded-lg transition-colors flex items-center ${
                      option === currentQuestion.correctAnswer
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-orange-50 hover:bg-orange-100 border border-orange-200"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm font-medium ${
                        option === currentQuestion.correctAnswer
                          ? "bg-green-500 text-white"
                          : "bg-orange-200 text-orange-800"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {option === currentQuestion.correctAnswer && (
                      <span className="ml-auto text-green-600">✓</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-md">
                <p className="font-medium text-orange-800">Correct Answer:</p>
                <p className="text-orange-700">{currentQuestion.correctAnswer}</p>
              </div>
            </div>

            <div className="bg-orange-50 px-6 py-3 flex justify-end">
              <button
                className="px-4 py-2 bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-lg transition-colors"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editModalOpen && editingQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-orange-800">
                  Edit Question
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-orange-400 hover:text-orange-600 focus:outline-none"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-md shadow-sm"
                    value={editingQuestion.questionText}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        questionText: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {editingQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center mr-2 text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <input
                          type="text"
                          className="flex-1 p-2 border border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-md shadow-sm"
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...editingQuestion.options];
                            updatedOptions[index] = e.target.value;
                            setEditingQuestion({
                              ...editingQuestion,
                              options: updatedOptions,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    className="w-full p-2 border border-orange-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-md shadow-sm bg-white"
                    value={editingQuestion.correctAnswer}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: e.target.value,
                      })
                    }
                  >
                    <option value="">Select correct answer</option>
                    {editingQuestion.options.map(
                      (option, index) =>
                        option && (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        )
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 px-6 py-3 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-lg transition-colors"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                onClick={handleEditSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
