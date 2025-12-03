import { useRouter } from 'next/navigation';
import { FaCheck, FaTimes, FaMinus, FaAward, FaTimesCircle, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

interface ResultProps {
  answers: { [key: string]: string };
  questions: Array<{
    id: string;
    questionText: string;
    correctAnswer: string;
  }>;
  timeTaken: number;
  quizTitle?: string;
}
const Result = ({ answers, questions, timeTaken, quizTitle = "Quiz" }: ResultProps) => {
    const router = useRouter();
    const resultRef = useRef(null);

   // Calculate results
  const totalQuestions = questions.length;
  const attempted = Object.keys(answers).length;
  const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const incorrect = attempted - correct;
  const skipped = totalQuestions - attempted;
  const percentage = Math.round((correct / totalQuestions) * 100);
  const isPassed = percentage >= 70;

  // Format time taken
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  // Download result as PDF
  const downloadResultAsPDF = () => {
    if (!resultRef.current) return;
    
    html2canvas(resultRef.current, {
      backgroundColor: "#ffffff", // Ensure a white background instead of transparent
      useCORS: true, // Enable cross-origin for images/fonts if used
    }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      const imgWidth = 210; // A4 width in mm
      // const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("quiz-result.pdf");
    });
  };
  


  return (
    <div ref={resultRef} className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Quiz Completed Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-4">Quiz Completed!</h2>
          <h3 className="text-xl font-medium text-orange-700 mb-4">{quizTitle}</h3>
          
          <div className="flex justify-center items-center mb-4">
            <div className="relative inline-block">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                />
                <circle
                  className={`${isPassed ? 'text-green-600' : 'text-red-600'}`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                  strokeDasharray={`${percentage * 3.64} 364`}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center mb-4">
            {isPassed ? (
              <div className="text-green-600 flex items-center">
                <FaAward className="mr-2 text-2xl" />
                <span className="font-semibold">Passed</span>
              </div>
            ) : (
              <div className="text-red-600 flex items-center">
                <FaTimesCircle className="mr-2 text-2xl" />
                <span className="font-semibold">Failed</span>
              </div>
            )}
          </div>

          <p className="text-gray-600">Time Taken: {formatTime(timeTaken)}</p>
        </div>
      </div>

      {/* Quiz Performance Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Quiz Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-green-600 text-xl font-bold mb-1">{correct}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 text-xl font-bold mb-1">{incorrect}</div>
            <div className="text-sm text-gray-600">Incorrect</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-gray-600 text-xl font-bold mb-1">{skipped}</div>
            <div className="text-sm text-gray-600">Skipped</div>
          </div>
        </div>
      </div>

      {/* Detailed Performance Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Detailed Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left">Question</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Your Answer</th>
                <th className="p-4 text-center">Correct Answer</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => {
                const status = !answers[q.id] ? 'Skipped' : 
                              answers[q.id] === q.correctAnswer ? 'Correct' : 'Incorrect';
                return (
                  <tr 
                    key={q.id} 
                    className={`
                      ${status === 'Correct' ? 'bg-green-50' :
                        status === 'Incorrect' ? 'bg-red-50' :
                        'bg-gray-50'}
                      hover:bg-gray-100 transition-colors
                    `}
                  >
                    <td className="p-4 border-b border-gray-200">
                      <span className="mr-2 font-medium text-gray-600">{index + 1}.</span>
                      {q.questionText}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-center">
                      {status === 'Correct' ? (
                        <div className="inline-flex items-center bg-green-100 text-green-600 px-3 py-1 rounded-full">
                          <FaCheck className="mr-2" />
                          Correct
                        </div>
                      ) : status === 'Incorrect' ? (
                        <div className="inline-flex items-center bg-red-100 text-red-600 px-3 py-1 rounded-full">
                          <FaTimes className="mr-2" />
                          Incorrect
                        </div>
                      ) : (
                        <div className="inline-flex items-center bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          <FaMinus className="mr-2" />
                          Skipped
                        </div>
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-center">
                      {answers[q.id] || 'N/A'}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-center font-semibold text-green-700">
                      {q.correctAnswer}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={downloadResultAsPDF}
          className="flex items-center px-6 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <FaDownload className="mr-2" />
          Download Result
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Result;