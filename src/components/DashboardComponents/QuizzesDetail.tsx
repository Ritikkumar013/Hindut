// import React, { useEffect, useState, useRef } from 'react';
// import { X, Clock, Calendar, CheckCircle2, XCircle, ListChecks,  Play, Maximize, Volume2, VolumeX, Pause, Minimize } from 'lucide-react';
// import { doc, getDoc, Timestamp } from 'firebase/firestore';
// import { db } from '@/config/firebase';
// import { motion, AnimatePresence } from 'framer-motion';
// import { format } from 'date-fns';

// interface QuizDetailProps {
//   quizId: string;
//   onClose: () => void;
// }

// interface Question {
//   id: string;
//   questionText: string;
//   options: string[];
//   correctAnswer: string;
//   category: string;
// }

// interface Quiz {
//   id: string;
//   title: string;
//   description: string;
//   is_active: boolean;
//   startTime: string;
//   endTime: string;
//   createdAt: string;
//   updatedAt: string;
//   questions_list: Question[];
// }

// const QuizDetail: React.FC<QuizDetailProps> = ({ quizId }) => {
//   const [quiz, setQuiz] = useState<Quiz | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [videoUrl, setVideoUrl] = useState<string>('');
//   const [showVideoModal, setShowVideoModal] = useState(false);

//   // Video player state
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const videoContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const quizDoc = await getDoc(doc(db, 'quizzes', quizId));

//         if (!quizDoc.exists()) {
//           throw new Error('Quiz not found');
//         }

//         const quizData = quizDoc.data();
//         console.log('Quiz Data:', quizData);

//         // Check if quiz has a video
//         try {
//           const videoDoc = await getDoc(doc(db, 'adminQuizVideos', quizId));
//           if (videoDoc.exists()) {
//             const videoData = videoDoc.data();
//             setVideoUrl(videoData.videoUrl);
//           }
//         } catch (videoError) {
//           console.error('Error fetching quiz video:', videoError);
//           // Don't set an error, just continue without video
//         }

//         // Helper function to safely convert timestamps
//         const convertTimestamp = (timestamp: Timestamp | string | Date | undefined): string => {
//           if (timestamp instanceof Timestamp) {
//             return timestamp.toDate().toISOString();
//           } else if (typeof timestamp === 'string') {
//             return timestamp;
//           } else if (timestamp instanceof Date) {
//             return timestamp.toISOString();
//           }
//           return new Date().toISOString();
//         };

//         // Ensure questions_list is properly formatted
//         const formattedQuestions = (quizData.questions_list || []).map((question: Record<string, unknown>) => {
//           console.log('Question Data:', question);
//           return {
//             id: String(question.id),
//             questionText: String(question.text),
//             options: Array.isArray(question.options) ? question.options as string[] : [],
//             correctAnswer: typeof question.correctAnswer === 'string' ? question.correctAnswer : '',
//             category: typeof question.category === 'string' ? question.category : ''
//           };
//         });

//         const formattedQuizData: Quiz = {
//           id: quizId,
//           title: quizData.title || '',
//           description: quizData.description || '',
//           is_active: quizData.is_active || false,
//           startTime: quizData.startTime || '',
//           endTime: quizData.endTime || '',
//           createdAt: convertTimestamp(quizData.createdAt),
//           updatedAt: convertTimestamp(quizData.updatedAt),
//           questions_list: formattedQuestions
//         };

//         setQuiz(formattedQuizData);
//       } catch (err) {
//         console.error('Error fetching quiz:', err);
//         setError('Failed to load quiz data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [quizId]);

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid date';
//       return format(date, 'MMM d, yyyy h:mm a');
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   // Format time for video player (converts seconds to MM:SS format)
//   const formatTime = (timeInSeconds: number) => {
//     if (isNaN(timeInSeconds)) return '00:00';

//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = Math.floor(timeInSeconds % 60);

//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="w-8 h-8 border-t-2 border-orange-500 border-solid rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 bg-red-50 text-red-700 rounded-lg">
//         {error}
//       </div>
//     );
//   }

//   if (!quiz) {
//     return (
//       <div className="p-4 bg-orange-50 text-orange-700 rounded-lg">
//         Quiz not found
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <div className="bg-white rounded-xl shadow-sm border border-orange-100">
//         {/* Header */}
//         <div className="p-6 border-b border-orange-100">
//           <div className="flex justify-between items-start">
//             <div>
//               <h2 className="text-2xl font-bold text-orange-800">{quiz.title}</h2>
//               <p className="text-gray-600 mt-2">{quiz.description}</p>
//             </div>
//           </div>
//         </div>

//         {/* Quiz Video (if available) */}
//         {videoUrl && (
//           <div className="p-6 border-b border-orange-100">
//             <h3 className="text-lg font-medium text-orange-800 mb-4">Quiz Video</h3>
//             <div className="aspect-video bg-black rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => setShowVideoModal(true)}>
//               <video
//                 src={videoUrl}
//                 className="w-full h-full object-contain"
//                 controls={false}
//               />
//               <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                 <div className="bg-orange-500 rounded-full p-4 text-white">
//                   <Play size={24} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Quiz Details */}
//         <div className="p-6 space-y-6">
//           {/* Status and Timestamps */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div className="flex items-center space-x-3">
//                 {quiz.is_active ? (
//                   <CheckCircle2 className="w-5 h-5 text-green-500" />
//                 ) : (
//                   <XCircle className="w-5 h-5 text-red-500" />
//                 )}
//                 <span className={`font-medium ${
//                   quiz.is_active ? 'text-green-700' : 'text-red-700'
//                 }`}>
//                   {quiz.is_active ? 'Active' : 'Inactive'}
//                 </span>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <Calendar className="w-5 h-5 text-orange-500" />
//                 <div>
//                   <p className="text-sm text-gray-500">Start Time</p>
//                   <p className="text-gray-700">{formatDate(quiz.startTime)}</p>
//                   <p className="text-xs text-gray-400">When the quiz starts</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <Calendar className="w-5 h-5 text-orange-500" />
//                 <div>
//                   <p className="text-sm text-gray-500">End Time</p>
//                   <p className="text-gray-700">{formatDate(quiz.endTime)}</p>
//                   <p className="text-xs text-gray-400">When the quiz ends</p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center space-x-3">
//                 <Clock className="w-5 h-5 text-orange-500" />
//                 <div>
//                   <p className="text-sm text-gray-500">Created</p>
//                   <p className="text-gray-700">{formatDate(quiz.createdAt)}</p>
//                   <p className="text-xs text-gray-400">When the quiz was first created</p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3">
//                 <Clock className="w-5 h-5 text-orange-500" />
//                 <div>
//                   <p className="text-sm text-gray-500">Last Updated</p>
//                   <p className="text-gray-700">{formatDate(quiz.updatedAt)}</p>
//                   <p className="text-xs text-gray-400">Most recent changes to the quiz</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Questions */}
//           <div>
//             <div className="flex items-center space-x-2 mb-4">
//               <ListChecks className="w-5 h-5 text-orange-500" />
//               <h3 className="text-lg font-semibold text-orange-800">
//                 Questions ({quiz.questions_list.length})
//               </h3>
//             </div>

//             <div className="space-y-4">
//               {quiz.questions_list.map((question, index) => (
//                 <div
//                   key={question.id}
//                   className="p-4 bg-orange-50 rounded-lg border border-orange-100"
//                 >
//                   <div className="flex items-start space-x-3">
//                     <span className="text-orange-600 font-medium">{index + 1}.</span>
//                     <p className="font-medium text-orange-800 flex-1">
//                       {question.questionText}
//                     </p>
//                   </div>
//                   <div className="mt-3 space-y-2">
//                     {question.options && question.options.length > 0 && (
//                       <div className="mt-2">
//                         <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
//                           {question.options.map((option: string, i: number) => (
//                             <li
//                               key={i}
//                               className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}
//                             >
//                               {option}
//                               {option === question.correctAnswer && ' (Correct)'}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Video Modal */}
//       <AnimatePresence>
//         {showVideoModal && videoUrl && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-4 relative"
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-semibold text-orange-800">
//                 {quiz?.title || 'Quiz Video'}
//               </h3>
//               <button
//                 onClick={() => setShowVideoModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div
//               ref={videoContainerRef}
//               className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
//             >
//               <video
//                 ref={videoRef}
//                 src={videoUrl}
//                 className="w-full h-full object-contain"
//                 onTimeUpdate={() => {
//                   if (videoRef.current) {
//                     setCurrentTime(videoRef.current.currentTime);
//                   }
//                 }}
//                 onDurationChange={() => {
//                   if (videoRef.current) {
//                     setDuration(videoRef.current.duration);
//                   }
//                 }}
//                 onPlay={() => setIsPlaying(true)}
//                 onPause={() => setIsPlaying(false)}
//                 onEnded={() => setIsPlaying(false)}
//               />

//               {/* Custom video controls */}
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
//                 {/* Progress bar / scrubber */}
//                 <div className="mb-3">
//                   <div
//                     className="h-1.5 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
//                     onClick={(e) => {
//                       if (videoRef.current) {
//                         const rect = e.currentTarget.getBoundingClientRect();
//                         const pos = (e.clientX - rect.left) / rect.width;
//                         videoRef.current.currentTime = pos * duration;
//                       }
//                     }}
//                   >
//                     <div
//                       className="h-full bg-orange-500"
//                       style={{ width: `${(currentTime / duration) * 100}%` }}
//                     ></div>
//                   </div>
//                   <div className="flex justify-between text-xs text-white mt-1">
//                     <span>{formatTime(currentTime)}</span>
//                     <span>{formatTime(duration)}</span>
//                   </div>
//                 </div>

//                 {/* Control buttons */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={() => {
//                         if (videoRef.current) {
//                           if (isPlaying) {
//                             videoRef.current.pause();
//                           } else {
//                             videoRef.current.play();
//                           }
//                         }
//                       }}
//                       className="text-white hover:text-orange-300 transition-colors"
//                     >
//                       {isPlaying ? <Pause size={24} /> : <Play size={24} />}
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (videoRef.current) {
//                           videoRef.current.muted = !videoRef.current.muted;
//                           setIsMuted(!isMuted);
//                         }
//                       }}
//                       className="text-white hover:text-orange-300 transition-colors"
//                     >
//                       {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
//                     </button>
//                   </div>
//                   <button
//                     onClick={() => {
//                       if (isFullscreen) {
//                         document.exitFullscreen();
//                       } else if (videoContainerRef.current) {
//                         videoContainerRef.current.requestFullscreen();
//                       }
//                       setIsFullscreen(!isFullscreen);
//                     }}
//                     className="text-white hover:text-orange-300 transition-colors"
//                   >
//                     {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default QuizDetail;


import React, { useEffect, useState, useRef } from 'react';
import { X, Clock, Calendar, CheckCircle2, XCircle, ListChecks,  Play, Maximize, Volume2, VolumeX, Pause, Minimize } from 'lucide-react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface QuizDetailProps {
  quizId: string;
  onClose: () => void;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  questions_list: Question[];
}

const QuizDetail: React.FC<QuizDetailProps> = ({ quizId }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));

        if (!quizDoc.exists()) {
          throw new Error('Quiz not found');
        }

        const quizData = quizDoc.data();
        console.log('Quiz Data:', quizData);

        // Check if quiz has a video
        try {
          const videoDoc = await getDoc(doc(db, 'adminQuizVideos', quizId));
          if (videoDoc.exists()) {
            const videoData = videoDoc.data();
            setVideoUrl(videoData.videoUrl);
          }
        } catch (videoError) {
          console.error('Error fetching quiz video:', videoError);
          // Don't set an error, just continue without video
        }

        // Helper function to safely convert timestamps
        const convertTimestamp = (timestamp: Timestamp | string | Date | undefined): string => {
          if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toISOString();
          } else if (typeof timestamp === 'string') {
            return timestamp;
          } else if (timestamp instanceof Date) {
            return timestamp.toISOString();
          }
          return new Date().toISOString();
        };

        // Ensure questions_list is properly formatted
        const formattedQuestions = (quizData.questions_list || []).map((question: Record<string, unknown>) => {
          console.log('Question Data:', question);
          return {
            id: String(question.id),
            questionText: String(question.text),
            options: Array.isArray(question.options) ? question.options as string[] : [],
            correctAnswer: typeof question.correctAnswer === 'string' ? question.correctAnswer : '',
            category: typeof question.category === 'string' ? question.category : ''
          };
        });

        const formattedQuizData: Quiz = {
          id: quizId,
          title: quizData.title || '',
          description: quizData.description || '',
          is_active: quizData.is_active || false,
          startTime: quizData.startTime || '',
          endTime: quizData.endTime || '',
          createdAt: convertTimestamp(quizData.createdAt),
          updatedAt: convertTimestamp(quizData.updatedAt),
          questions_list: formattedQuestions
        };

        setQuiz(formattedQuizData);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  // Format time for video player (converts seconds to MM:SS format)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-t-2 border-orange-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 bg-orange-50 text-orange-700 rounded-lg">
        Quiz not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-orange-100">
        {/* Header */}
        <div className="p-6 border-b border-orange-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-orange-800">{quiz.title}</h2>
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            </div>
          </div>
        </div>

        {/* Quiz Video (if available) */}
        {videoUrl && (
          <div className="p-6 border-b border-orange-100">
            <h3 className="text-lg font-medium text-orange-800 mb-4">Quiz Video</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => setShowVideoModal(true)}>
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls={false}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-orange-500 rounded-full p-4 text-white">
                  <Play size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Details */}
        <div className="p-6 space-y-6">
          {/* Status and Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {quiz.is_active ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium ${
                  quiz.is_active ? 'text-green-700' : 'text-red-700'
                }`}>
                  {quiz.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p className="text-gray-700">{formatDate(quiz.startTime)}</p>
                  <p className="text-xs text-gray-400">When the quiz starts</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p className="text-gray-700">{formatDate(quiz.endTime)}</p>
                  <p className="text-xs text-gray-400">When the quiz ends</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-gray-700">{formatDate(quiz.createdAt)}</p>
                  <p className="text-xs text-gray-400">When the quiz was first created</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-gray-700">{formatDate(quiz.updatedAt)}</p>
                  <p className="text-xs text-gray-400">Most recent changes to the quiz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ListChecks className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-800">
                Questions ({quiz.questions_list.length})
              </h3>
            </div>

            <div className="space-y-4">
              {quiz.questions_list.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-600 font-medium">{index + 1}.</span>
                    <p className="font-medium text-orange-800 flex-1">
                      {question.questionText}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {question.options && question.options.length > 0 && (
                      <div className="mt-2">
                        <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
                          {question.options.map((option: string, i: number) => (
                            <li
                              key={i}
                              className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}
                            >
                              {option}
                              {option === question.correctAnswer && ' (Correct)'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-4 relative"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-orange-800">
                {quiz?.title || 'Quiz Video'}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div
              ref={videoContainerRef}
              className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onDurationChange={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Custom video controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress bar / scrubber */}
                <div className="mb-3">
                  <div
                    className="h-1.5 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (videoRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime = pos * duration;
                      }
                    }}
                  >
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-white mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                          } else {
                            videoRef.current.play();
                          }
                        }
                      }}
                      className="text-white hover:text-orange-300 transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !videoRef.current.muted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="text-white hover:text-orange-300 transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (isFullscreen) {
                        document.exitFullscreen();
                      } else if (videoContainerRef.current) {
                        videoContainerRef.current.requestFullscreen();
                      }
                      setIsFullscreen(!isFullscreen);
                    }}
                    className="text-white hover:text-orange-300 transition-colors"
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizDetail;