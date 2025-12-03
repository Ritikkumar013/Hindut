interface QuestionDisplayProps {
  question: {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
  };
  selectedAnswer: string;
  onAnswer: (questionId: string, answer: string) => void;
  reviewMode: boolean;
}

const QuestionDisplay = ({ question, selectedAnswer, onAnswer, reviewMode }: QuestionDisplayProps) => {
  const optionLabels = ['A', 'B', 'C', 'D']; // Add labels for options

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{question.questionText}</h2>

      <div className="space-y-3">
        {question?.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(question.id, option)}
            className={`w-full p-4 text-left rounded-lg transition-colors ${selectedAnswer === option
                ? reviewMode
                  ? option === question.correctAnswer
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  : 'bg-orange-100 text-orange-800'
                : 'bg-gray-50 text-gray-800 hover:bg-orange-50'
              }`}
            disabled={reviewMode}
          >
            <span className="font-bold mr-2">{optionLabels[index]}.</span> {option}
          </button>
        ))}
      </div>

      {reviewMode && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <p className="font-medium text-orange-800">
            Correct Answer: {question.correctAnswer}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
