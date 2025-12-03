interface QuizNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  questions: { id: string }[]; // Added to get question IDs
  answers: { [key: string]: string };
  onNavigate: (index: number) => void;
}

const QuizNavigation = ({ totalQuestions, currentQuestion, questions, answers, onNavigate }: QuizNavigationProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-orange-800 mb-4">Question Navigation</h3>
      <div className="grid grid-cols-5 gap-2">
      {(questions || []).map((question, i) => (
          <button
            key={question.id}
            onClick={() => onNavigate(i)}
            className={`p-2 rounded-lg text-center ${
              i === currentQuestion
                ? 'bg-orange-600 text-white'
                : answers[question.id]
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            } hover:opacity-80 transition-opacity`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-orange-600 rounded-full transition-all"
            style={{
              width: `${(Object.keys(answers).length / totalQuestions) * 100}%`
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {Object.keys(answers).length} of {totalQuestions} questions answered
        </p>
      </div>
    </div>
  );
};

export default QuizNavigation;
