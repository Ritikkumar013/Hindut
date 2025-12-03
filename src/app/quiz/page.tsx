"use client";
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import QuizTimer from '@/components/QuizComponents/QuizTimer';
import QuizNavigation from '@/components/QuizComponents/QuizNavigation';
import QuestionDisplay from '@/components/QuizComponents/QuestionDisplay';
import Result from '@/components/QuizComponents/Result';
import { doc, getDoc} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { optedQuizService } from '@/services/optedQuizService';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface QuizData {
  id: string;
  title: string;
  is_active: boolean;
  startTime?: string;
  endTime?: string;
  quizTime?: number;
  questions_list: (string | { id?: string; path?: string })[];
  [key: string]: unknown;
}

interface OptedQuiz {
  id: string;
  quizId: string;
  userId: string;
  [key: string]: unknown;
}

const QuizPageContent = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('id');
  
  // ✅ FIXED: Line 27 - Specific QuizData interface instead of any
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizLoading, setQuizLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optedQuizId, setOptedQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!quizId || !user) return;

    const fetchQuizAndQuestions = async () => {
      try {
        setQuizLoading(true);
        // Fetch the quiz
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        
        if (!quizDoc.exists()) {
          setError('Quiz not found');
          setQuizLoading(false);
          return;
        }
        
        const quizData = quizDoc.data() as QuizData;
        
        // Check if the quiz is active and within time bounds
        const startTime = quizData.startTime ? new Date(quizData.startTime) : null;
        const endTime = quizData.endTime ? new Date(quizData.endTime) : null;
        const now = new Date();
        
        if (!quizData.is_active || (startTime && now < startTime) || (endTime && now > endTime)) {
          setError('This quiz is not currently available');
          setQuizLoading(false);
          return;
        }
        
        // Set the quiz data
        setQuiz({
          ...quizData,
          id: quizDoc.id
        });
        
        // ✅ FIXED: Line 81 - Specific OptedQuiz interface instead of any
        const optedQuizzes = await optedQuizService.getOptedQuizzes(user.uid);
        const optedQuiz = optedQuizzes.find((opt: OptedQuiz) => opt.quizId === quizId);
        
        if (!optedQuiz) {
          setError('You need to register for this quiz first');
          setQuizLoading(false);
          return;
        }
        
        setOptedQuizId(optedQuiz.id);
        
        // Calculate time limit from quiz settings (or use default)
        const quizTime = quizData.quizTime || 3600;
        setTimeLeft(quizTime);
        
        // Fetch questions from quiz's questions_list
        const questionsData = quizData.questions_list || [];
        const loadedQuestions: Question[] = [];
        
        for (const questionRef of questionsData) {
          try {
            // If it's a reference
            let questionId: string = '';
            if (typeof questionRef === 'string') {
              questionId = questionRef;
            } else if (questionRef.id) {
              questionId = questionRef.id;
            } else if (questionRef.path) {
              // Extract ID from path if it's a Firestore reference
              const pathParts = questionRef.path.split('/');
              questionId = pathParts[pathParts.length - 1];
            }
            
            if (!questionId) continue;
            
            const questionDoc = await getDoc(doc(db, 'questions', questionId));
            if (questionDoc.exists()) {
              const data = questionDoc.data();
              loadedQuestions.push({
                id: questionDoc.id,
                questionText: data.text || data.questionText || '',
                options: data.options || [],
                correctAnswer: data.correctAnswer || ''
              });
            }
          } catch (err: unknown) {
            console.error('Error fetching question:', err);
          }
        }
        
        setQuestions(loadedQuestions);
        setQuizLoading(false);
      } catch (error: unknown) {
        console.error('Error fetching quiz and questions:', error);
        setError('Failed to load quiz');
        setQuizLoading(false);
      }
    };

    fetchQuizAndQuestions();
  }, [quizId, user]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    const timeTaken = quiz?.quizTime ? quiz.quizTime - timeLeft : 3600 - timeLeft;
    setTimeTaken(timeTaken);
    setIsSubmitted(true);
    
    // Calculate score
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    console.log('Submitting answers:', { answers, score, timeTaken });
    
    // Update the opted quiz with results if we have an optedQuizId
    if (optedQuizId && user) {
      try {
        await optedQuizService.updateOptedQuiz(optedQuizId, {
          result: score,
          status: 'Completed',
          quizAttempt: true,
          attemptDate: new Date(),
          answers: answers,
          userId: '',
          quizId: '',
          registerDate: ''
        });
        console.log('Quiz results saved successfully');
      } catch (error: unknown) {
        console.error('Error saving quiz results:', error);
      }
    }
  };

  // Rest of your JSX remains exactly the same...
  if (loading || quizLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="text-red-500 text-5xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-orange-800 mb-4">Quiz Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-orange-50 py-8">
        <Result
          answers={answers}
          questions={questions}
          timeTaken={timeTaken}
          quizTitle={quiz?.title || 'Quiz'}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-orange-50">
      {/* Left Panel */}
      <div className="w-1/4 bg-white shadow-lg p-6">
        <QuizNavigation
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          questions={questions}
          answers={answers}
          onNavigate={setCurrentQuestion}
        />

        <div className="mt-6 space-y-4">
          <button
            onClick={() => setReviewMode(!reviewMode)}
            className="w-full py-2 px-4 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
          >
            {reviewMode ? 'Continue Quiz' : 'Review Answers'}
          </button>

          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Timer */}
          <div className="flex justify-end mb-6">
            <QuizTimer 
              timeLeft={timeLeft} 
              setTimeLeft={setTimeLeft} 
              onTimeExpired={handleSubmit} 
            />
          </div>

          {/* Question Display */}
          {questions.length > 0 && questions[currentQuestion] && (
            <QuestionDisplay
              question={questions[currentQuestion]}
              selectedAnswer={answers[questions[currentQuestion].id] || ""}
              onAnswer={handleAnswer}
              reviewMode={reviewMode}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQuestion === questions.length - 1}
              className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-600"></div>
      </div>
    }>
      <QuizPageContent />
    </Suspense>
  );
}
