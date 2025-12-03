'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { quizService } from "@/services/quizService";
import { optedQuizService } from "@/services/optedQuizService";
import { firebaseStorageService } from "@/services/firebaseStorageService";
import { toast } from "react-toastify";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the RazorpayPayment component to avoid SSR issues
const RazorpayPayment = dynamic(
  () => import("@/components/RazorpayPayment"),
  { ssr: false }
);

// Helper function to format Firestore timestamp
// const formatCreatedDate = (createdAt: any): string => {
//   try {
//     // Handle Firestore timestamp (has seconds and nanoseconds)
//     if (createdAt?.seconds) {
//       return new Date(createdAt.seconds * 1000).toLocaleDateString();
//     }
//     // Handle timestamp as a Date object
//     else if (createdAt instanceof Date) {
//       return createdAt.toLocaleDateString();
//     }
//     // Handle timestamp as a string
//     else if (typeof createdAt === 'string') {
//       return new Date(createdAt).toLocaleDateString();
//     }
//     // Handle timestamp as a number (milliseconds)
//     else if (typeof createdAt === 'number') {
//       return new Date(createdAt).toLocaleDateString();
//     }
//     // Handle timestamp as an object with toDate method (Firestore Timestamp)
//     else if (createdAt?.toDate && typeof createdAt.toDate === 'function') {
//       return createdAt.toDate().toLocaleDateString();
//     }
//     // Log the actual value for debugging
//     console.log('Unhandled createdAt format:', createdAt);
//     return 'Date unavailable';
//   } catch (error) {
//     console.error('Error formatting date:', error, createdAt);
//     return 'Date unavailable';
//   }
// };

function Page() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  // const targetValues = [100, 200, 60, 400]; 
  const counterTexts = ["Users Registered", "Quizzes Completed", "Time to Complete", "Positive Feedback"];
  const animationDuration = 3000;

  // Define Quiz interface
  interface Quiz {
    id: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    is_active?: boolean;
    createdAt?: unknown;
    questions_list?: unknown[];
  }

  // State for quiz and video
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setRegisteringQuizId] = useState<string | null>(null);
  const [registeredQuizIds, setRegisteredQuizIds] = useState<string[]>([]);
  const [quizVideo, setQuizVideo] = useState<string>('');

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to access this page");
      router.push("/signup");
    }
  }, [user, loading, router]);

  // Counter animation effect
  useEffect(() => {
    const localTargetValues = [100, 200, 60, 400];
    const intervals = localTargetValues.map((target, index) => {
      const intervalSpeed = animationDuration / target;
      return setInterval(() => {
        setCounters((prev) =>
          prev.map((count, i) =>
            i === index && count < target ? count + 1 : count
          )
        );
      }, intervalSpeed);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [animationDuration]);

  // Function to fetch active quiz, video, and user registration status
  const fetchActiveQuiz = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const quizzes = await quizService.getActiveQuizzes();

      // Log quiz data for debugging
      console.log('Fetched active quizzes:', quizzes);

      // We only need the first active quiz (since only one should be active at a time)
      if (quizzes.length > 0) {
        const activeQuiz = quizzes[0];
        setActiveQuizzes([activeQuiz]);

        // Fetch quiz video if available
        try {
          const videoData = await firebaseStorageService.getQuizVideoById(activeQuiz.id);
          if (videoData && videoData.videoUrl) {
            console.log('Found quiz video:', videoData.videoUrl);
            setQuizVideo(videoData.videoUrl);
          }
        } catch (videoError) {
          console.error('Error fetching quiz video:', videoError);
          // Non-critical error, continue without video
        }
      } else {
        setActiveQuizzes([]);
      }

      // Fetch user's registered quizzes if user is logged in
      if (user) {
        console.log('Fetching registration status for user:', user.uid);
        const userRegistrations = await optedQuizService.getOptedQuizzes(user.uid);
        console.log('User registrations:', userRegistrations);

        const registeredIds = userRegistrations.map((reg: { quizId: string }) => reg.quizId);
        console.log('Setting registeredQuizIds to:', registeredIds);

        setRegisteredQuizIds(registeredIds);

        if (registeredIds.length > 0) {
          console.log('User has registered for quizzes:', registeredIds);
          if (quizzes.length > 0 && registeredIds.includes(quizzes[0].id)) {
            console.log('User is registered for the active quiz:', quizzes[0].id);
          }
        } else {
          console.log('User has not registered for any quizzes');
        }
      } else {
        console.log('No user logged in, skipping registration check');
      }
    } catch (error) {
      console.error("Error fetching active quiz:", error);
      toast.error("Failed to load quiz. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Function to handle quiz registration
  const handleRegisterForQuiz = async (quizId: string): Promise<void> => {
    if (!user) {
      toast.error("You must be logged in to register for a quiz");
      return;
    }

    // Check if already registered
    if (registeredQuizIds.includes(quizId)) {
      // Redirect to dashboard if already registered
      router.push('/dashboard');
      return;
    }

    try {
      setRegisteringQuizId(quizId);
      const selectedQuiz = activeQuizzes.find(quiz => quiz.id === quizId);
      // const quizTitle = selectedQuiz?.title || 'quiz';

      // Check if quiz is within valid time range
      const now = new Date();
      const startTime = selectedQuiz?.startTime ? new Date(selectedQuiz.startTime) : null;
      const endTime = selectedQuiz?.endTime ? new Date(selectedQuiz.endTime) : null;

      if (startTime && now < startTime) {
        toast.warning(`This quiz is not yet available. It starts on ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`);
        setRegisteringQuizId(null);
        return;
      }

      if (endTime && now > endTime) {
        toast.warning(`This quiz has ended on ${endTime.toLocaleDateString()} at ${endTime.toLocaleTimeString()}`);
        setRegisteringQuizId(null);
        return;
      }

      // Show payment modal instead of directly registering
      setSelectedQuizId(quizId);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error preparing for quiz registration:", error);
      toast.error("Failed to prepare registration. Please try again later.");
      setRegisteringQuizId(null);
    }
  };

  // Function to handle successful payment and complete registration
  const handlePaymentSuccess = async (): Promise<void> => {
    if (!selectedQuizId || !user) return;

    try {
      // const selectedQuiz = activeQuizzes.find(quiz => quiz.id === selectedQuizId);
      // const quizTitle = selectedQuiz?.title || 'quiz';

      const response = await optedQuizService.optForQuiz({
        userId: user.uid,
        quizId: selectedQuizId,
        registerDate: new Date(),
        result: null,
        quizAttempt: false,
        status: "Registered"
      });

      // Check if user was already registered
      if ('alreadyRegistered' in response && response.alreadyRegistered) {
        // User was already registered, just update the UI
        if (!registeredQuizIds.includes(selectedQuizId)) {
          setRegisteredQuizIds(prev => [...prev, selectedQuizId]);
        }
        return;
      }

      // Update registered quizzes list for new registration
      setRegisteredQuizIds(prev => {
        console.log('Adding quiz to registeredQuizIds:', selectedQuizId);
        console.log('Previous registeredQuizIds:', prev);
        const newIds = [...prev, selectedQuizId];
        console.log('New registeredQuizIds:', newIds);
        return newIds;
      });

      // Close the payment modal but don't redirect
      setShowPaymentModal(false);

      // Show success toast
      toast.success(`Successfully registered for the quiz! Click Play to start.`);

      // Keep the selectedQuizId for UI updates
      // The Play button will be shown instead of Register
    } catch (error) {
      console.error("Error registering for quiz:", error);
      toast.error("Registration failed. Please try again later.");
    } finally {
      setRegisteringQuizId(null);
    }
  };

  // Function to handle payment failure
  const handlePaymentFailure = () => {
    toast.error("Payment failed or was cancelled. Please try again.");
    setRegisteringQuizId(null);
    setShowPaymentModal(false);
    setSelectedQuizId(null);
  };

  // Format date for display
  const formatDate = (dateInput: unknown): string => {
    if (!dateInput) return 'Not specified';

    try {
      let date: Date;

      // Handle different date formats
      interface FirestoreTimestamp {
        seconds: number;
        [key: string]: unknown;
      }

      if (typeof dateInput === 'object' && 'seconds' in dateInput && typeof (dateInput as FirestoreTimestamp).seconds === 'number') {
        date = new Date((dateInput as FirestoreTimestamp).seconds * 1000);
      } else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'Invalid date';
      }

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format time for video player
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Toggle video play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle video mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Load active quiz when component mounts or user changes
  useEffect(() => {
    fetchActiveQuiz();
  }, [user, fetchActiveQuiz]); // Add fetchActiveQuiz to deps

  return (
    <>
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-[#a6400a] to-[#ff6b1a] pt-16 sm:pt-20 md:pt-28 pb-10 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row gap-8 md:gap-14 items-center justify-between px-4 sm:px-6 md:px-10 relative">
          <div className="w-full md:basis-1/2 text-white transform transition-all duration-500 hover:translate-x-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-200">
              {activeQuizzes[0]?.title || 'Test your knowledge of hindutva'}
            </h1>
            <p className="text-base sm:text-lg mb-6 md:mb-8 text-orange-100 leading-relaxed">
              {activeQuizzes[0]?.description || 'Take the quiz and test your knowledge of hindutva.'}
            </p>
            {activeQuizzes.length > 0 && activeQuizzes[0] && (activeQuizzes[0].startTime || activeQuizzes[0].endTime) && (
              <div className="mb-6 md:mb-8 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Quiz Schedule</h3>
                <div className="space-y-2">
                  {activeQuizzes[0].startTime && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">Starts:</span>
                      <span className="text-gray-600">{formatDate(activeQuizzes[0].startTime)}</span>
                    </div>
                  )}
                  {activeQuizzes[0].endTime && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">Ends:</span>
                      <span className="text-gray-600">{formatDate(activeQuizzes[0].endTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => user ? (activeQuizzes.length > 0 ? handleRegisterForQuiz(activeQuizzes[0].id) : fetchActiveQuiz()) : router.push('/signup')}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${registeredQuizIds.includes(activeQuizzes[0]?.id) ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-orange-600 hover:bg-orange-50'} group`}
            >
              {!user ? 'Login to Register' : registeredQuizIds.includes(activeQuizzes[0]?.id) ? 'Play Quiz Now' : 'Pay ₹1 to Register'}
              <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            {user && registeredQuizIds.includes(activeQuizzes[0]?.id) && (
              <p className="mt-2 text-orange-200 text-sm italic">You&apos;re already registered for this quiz. Click to play it now!</p>
            )}
          </div>
          <div className="w-full md:basis-1/2 transform transition-all duration-500 hover:-translate-y-2 mt-8 md:mt-0">
            {activeQuizzes.length > 0 && activeQuizzes[0] ? (
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm shadow-xl border border-white/10 p-4 overflow-hidden">
                {quizVideo ? (
                  <div ref={videoContainerRef} className="w-full h-full relative rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      src={quizVideo}
                      className="w-full h-full object-cover"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-xs">{formatTime(currentTime)}</span>
                        <span className="text-white text-xs">{formatTime(duration)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = Number(e.target.value);
                          }
                        }}
                        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex space-x-3">
                          <button onClick={togglePlay} className="text-white hover:text-orange-300 transition-colors">
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                          </button>
                          <button onClick={toggleMute} className="text-white hover:text-orange-300 transition-colors">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                        </div>
                        <button onClick={toggleFullscreen} className="text-white hover:text-orange-300 transition-colors">
                          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center text-white">
                    <svg className="w-12 h-12 text-orange-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-center text-orange-100">No video available for this quiz</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl backdrop-blur-sm shadow-xl border border-white/10 p-4 flex items-center justify-center">
                <div className="text-white text-opacity-80 text-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-orange-200 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-base sm:text-lg font-medium">Loading Quiz...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-base sm:text-lg font-medium">No Active Quiz Available</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About Quiz Section */}
      <div className="w-full py-12 sm:py-16 md:py-20 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row gap-8 md:gap-14 items-center justify-between px-4 sm:px-6 md:px-10">
          <div className="w-full md:basis-1/2 transform transition-all duration-500 hover:scale-105 order-2 md:order-1">
            {/* <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[460px] bg-gradient-to-tr from-orange-100 to-orange-50 rounded-2xl shadow-2xl overflow-hidden relative">
              {activeQuizzes.length > 0 && activeQuizzes[0] ? (
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="bg-white/90 rounded-xl p-4 shadow-lg">
                    <h3 className="text-xl font-bold text-orange-800 mb-2">{activeQuizzes[0].title || 'Quiz Details'}</h3>
                    <p className="text-orange-600 text-sm mb-3 line-clamp-3">{activeQuizzes[0].description || 'No description available'}</p>

                    <div className="space-y-2">
                      {activeQuizzes[0].startTime && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 mr-2">Starts:</span>
                          <span className="text-gray-600">{formatDate(activeQuizzes[0].startTime)}</span>
                        </div>
                      )}
                      {activeQuizzes[0].endTime && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700 mr-2">Ends:</span>
                          <span className="text-gray-600">{formatDate(activeQuizzes[0].endTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#a6400a] to-[#ff6b1a] text-white p-4 rounded-xl shadow-lg">
                    <h4 className="font-semibold mb-1">{registeredQuizIds.includes(activeQuizzes[0].id) ? 'You\'re all set!' : 'Ready to test your knowledge?'}</h4>
                    <p className="text-sm text-white/90 mb-3">{registeredQuizIds.includes(activeQuizzes[0].id) ? 'You\'ve already registered for this quiz. Click below to play now.' : 'Register now to participate in this quiz and challenge yourself.'}</p>
                    <button
                      onClick={() => user ? (handleRegisterForQuiz(activeQuizzes[0].id)) : router.push('/login')}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        registeredQuizIds.includes(activeQuizzes[0].id)
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-white text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {registeredQuizIds.includes(activeQuizzes[0].id) ? 'Play Quiz Now' : 'Register Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-[#a6400a]/80 to-[#ff6b1a]/80 flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-white text-base sm:text-lg md:text-xl font-medium px-4 sm:px-8 text-center">Loading Quiz...</p>
                    </div>
                  ) : (
                    <p className="text-white text-base sm:text-lg md:text-xl font-medium px-4 sm:px-8 text-center">No active quiz available at the moment</p>
                  )}
                </div>
              )}
            </div> */}
          </div>
          <div className="w-full md:basis-1/2 order-1 md:order-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 md:mb-6 font-bold bg-gradient-to-r from-[#a6400a] to-[#ff6b1a] bg-clip-text text-transparent">
              About This Quiz
            </h2>
            <p className="text-base sm:text-lg mb-6 md:mb-8 text-gray-700 leading-relaxed">
              Our quizzes are thoughtfully designed to test and enhance your knowledge about the philosophical, cultural, and historical aspects of Hindutva. Each quiz provides a unique opportunity to learn and grow.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="group bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300">
                <div className="text-orange-600 mb-3 md:mb-4 group-hover:scale-110 transform transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h4 className="text-lg sm:text-xl text-gray-800 font-semibold mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors">
                  Knowledge Assessment
                </h4>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Test your understanding of core Hindutva principles and historical context.
                </p>
              </div>
              <div className="group bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300">
                <div className="text-orange-600 mb-3 md:mb-4 group-hover:scale-110 transform transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h4 className="text-lg sm:text-xl text-gray-800 font-semibold mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors">
                  Cultural Learning
                </h4>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Explore the rich cultural heritage and traditions that shape Hindutva philosophy.
                </p>
              </div>
              <div className="group bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300">
                <div className="text-orange-600 mb-3 md:mb-4 group-hover:scale-110 transform transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h4 className="text-lg sm:text-xl text-gray-800 font-semibold mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors">
                  Historical Insights
                </h4>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Discover key historical events and figures that influenced Hindutva thought.
                </p>
              </div>
              <div className="group bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100 hover:border-orange-300">
                <div className="text-orange-600 mb-3 md:mb-4 group-hover:scale-110 transform transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h4 className="text-lg sm:text-xl text-gray-800 font-semibold mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors">
                  Community Engagement
                </h4>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                  Connect with others and share your knowledge through interactive discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="w-full bg-gradient-to-r from-[#a6400a] to-[#ff6b1a] py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 md:mb-12">Our Impact in Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {counters.map((count, index) => (
              <div
                key={index}
                className="group transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transform transition-transform duration-300">
                      {count}
                      <span className="text-orange-200">
                        {index === 0 ? "+" : index === 2 ? "min" : index === 3 ? "+" :""}
                      </span>
                    </h3>
                    <p className="text-base sm:text-lg text-orange-100 mt-2 font-medium">
                      {counterTexts[index]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full py-12 sm:py-16 md:py-24 bg-gradient-to-br from-[#a6400a] to-[#ff6b1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-10 relative">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">What Our Participants Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200">Discover why learners love our quiz experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="group transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="flex space-x-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transform transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6 italic">
                  &quot;This quiz was challenging and insightful. I learned so much about Hindutva that I didn`&apos;t know before!&quot;
                </p>
                <div className="flex items-center">
                  <div className="ml-0 sm:ml-3">
                    <p className="text-white font-semibold text-base sm:text-lg">Rajesh S.</p>
                    <p className="text-orange-200 text-xs sm:text-sm">Quiz Participant</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="flex space-x-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transform transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6 italic">
                  &quot;The questions are thoughtfully prepared. I appreciate the detailed explanations provided after each answer.&quot;
                </p>
                <div className="flex items-center">
                  <div className="ml-0 sm:ml-3">
                    <p className="text-white font-semibold text-base sm:text-lg">Priya M.</p>
                    <p className="text-orange-200 text-xs sm:text-sm">Quiz Enthusiast</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group transform hover:scale-105 transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="flex space-x-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transform transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6 italic">
                  &quot;Well-organized quiz with a perfect balance of historical facts and philosophical concepts. Highly recommended!&quot;
                </p>
                <div className="flex items-center">
                  <div className="ml-0 sm:ml-3">
                    <p className="text-white font-semibold text-base sm:text-lg">Vikram P.</p>
                    <p className="text-orange-200 text-xs sm:text-sm">Knowledge Seeker</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-orange-800 mb-6">
              {registeredQuizIds.includes(activeQuizzes[0]?.id) ? 'Ready to Play Your Quiz?' : 'Ready to Test Your Knowledge?'}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {registeredQuizIds.includes(activeQuizzes[0]?.id)
                ? 'You\'ve successfully registered for this quiz. Click below to start your quiz attempt.'
                : 'Join thousands of participants who have already taken the quiz and enhanced their understanding of Hindutva principles.'}
            </p>
            <button
              onClick={() => user ? (activeQuizzes.length > 0 ? handleRegisterForQuiz(activeQuizzes[0].id) : fetchActiveQuiz()) : router.push('/signup')}
              className={`px-8 py-4 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
                registeredQuizIds.includes(activeQuizzes[0]?.id)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {!user ? 'Login to Register' : registeredQuizIds.includes(activeQuizzes[0]?.id) ? 'Play Quiz Now' : 'Pay ₹1 to Register'}
            </button>
            {user && registeredQuizIds.includes(activeQuizzes[0]?.id) && (
              <p className="mt-4 text-sm text-gray-600 italic">Your quiz is waiting for you in the dashboard. Good luck!</p>
            )}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedQuizId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {registeredQuizIds.includes(selectedQuizId || '') ? 'Play Quiz' : 'Complete Registration'}
                </h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedQuizId(null);
                    setRegisteringQuizId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                {registeredQuizIds.includes(selectedQuizId || '') ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                    <h4 className="text-lg font-semibold text-green-800 mb-2">Already Registered</h4>
                    <p className="text-gray-600 mb-4">
                      You`&apos;re already registered for this quiz. Click the Play button below to start the quiz.
                    </p>
                  </div>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Quiz Registration Fee</h4>
                    <p className="text-gray-600 mb-4">
                      To register for this quiz, a small fee of ₹1 is required. This helps us maintain the quality of our platform.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Registration Fee:</span>
                        <span className="font-bold text-orange-600">₹1.00</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {activeQuizzes.length > 0 && selectedQuizId && (
                <RazorpayPayment
                  quizId={selectedQuizId}
                  quizTitle={activeQuizzes.find(q => q.id === selectedQuizId)?.title || 'Quiz'}
                  isRegistered={registeredQuizIds.includes(selectedQuizId)}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                />
              )}

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedQuizId(null);
                  setRegisteringQuizId(null);
                }}
                className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {registeredQuizIds.includes(selectedQuizId || '') ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Page;