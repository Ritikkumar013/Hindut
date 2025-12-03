import { useEffect } from 'react';

interface QuizTimerProps {
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  onTimeExpired?: () => void;
}

const QuizTimer = ({ timeLeft, setTimeLeft, onTimeExpired }: QuizTimerProps) => {
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 0) {
          clearInterval(timer);
          // Call the onTimeExpired callback if time runs out and it exists
          if (onTimeExpired) {
            onTimeExpired();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setTimeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
      Time Remaining: {formatTime(timeLeft)}
    </div>
  );
};

export default QuizTimer;