import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, XCircle, Trash2, RefreshCw, Search, ChevronDown, ChevronUp, Video, AlertCircle, Play, Maximize, Volume2, VolumeX, Pause, Minimize } from 'lucide-react';
import { toast } from 'react-toastify';
import { QuizVideo } from '@/services/adminQuizVideoService';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { quizService } from '@/services/quizService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  startTime: string;
  endTime: string;
}

interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
  speed: number;
  timeRemaining: number | null;
}

const AdminQuizVideoUpload: React.FC = () => {
  // State for quizzes and videos
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizVideos, setQuizVideos] = useState<QuizVideo[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // State for upload functionality
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percent: 0,
    loaded: 0,
    total: 0,
    speed: 0,
    timeRemaining: null
  });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State for UI
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'title' | 'uploadedAt'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Video player state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<QuizVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  // Fetch quizzes and videos on component mount
  useEffect(() => {
    fetchQuizzes();
    fetchQuizVideos();
  }, []);

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      setIsLoadingQuizzes(true);
      const quizzesData = await quizService.getAllQuizzes();
      console.log('[AdminQuizVideoUpload] Quizzes loaded:', quizzesData.length);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('[AdminQuizVideoUpload] Error fetching quizzes:', error);
      toast.error('Failed to load quizzes from API, trying Firestore directly');

      // Fallback to Firestore
      try {
        const quizzesRef = collection(db, 'quizzes');
        const querySnapshot = await getDocs(quizzesRef);
        const quizzesFromFirestore: Quiz[] = querySnapshot.docs.map(doc => {
          const data: Record<string, unknown> = doc.data();
          return {
            id: doc.id,
            title: typeof data?.title === 'string' ? data.title : '',
            description: typeof data?.description === 'string' ? data.description : '',
            is_active: typeof data?.is_active === 'boolean' ? data.is_active : !!data?.is_active,
            startTime: data?.startTime ? String(data.startTime) : '',
            endTime: data?.endTime ? String(data.endTime) : ''
          };
        });
        console.log('[AdminQuizVideoUpload] Quizzes loaded from Firestore:', quizzesFromFirestore.length);
        setQuizzes(quizzesFromFirestore);
      } catch (fbError) {
        console.error('[AdminQuizVideoUpload] Firestore fallback failed:', fbError);
        toast.error('Failed to load quizzes');
      }
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  // Fetch all quiz videos with optimized loading
  const fetchQuizVideos = async () => {
    try {
      setIsLoadingVideos(true);

      // First, quickly get the quizzes to show the UI faster
      setIsLoadingVideos(false);

      // Then load videos in the background
      const videos = await firebaseStorageService.getAllQuizVideos();
      console.log('[AdminQuizVideoUpload] Quiz videos loaded:', videos.length);

      // Log video details for debugging
      videos.forEach(video => {
        console.log('[AdminQuizVideoUpload] Video details:', {
          quizId: video.quizId,
          fileName: video.fileName,
          uploadedAt: video.uploadedAt,
          formattedDate: formatDate(video.uploadedAt)
        });
      });

      // Convert uploadedAt and updatedAt to string format for compatibility
      const normalizedVideos = videos.map(video => ({
        ...video,
        uploadedAt: typeof video.uploadedAt === 'string' ? video.uploadedAt : video.uploadedAt.toISOString(),
        updatedAt: video.updatedAt ? (typeof video.updatedAt === 'string' ? video.updatedAt : video.updatedAt.toISOString()) : undefined
      }));

      setQuizVideos(normalizedVideos);
    } catch (error) {
      console.error('[AdminQuizVideoUpload] Error fetching quiz videos:', error);
      // Don't show toast for this error as it's expected when no videos exist
      setIsLoadingVideos(false);
    }
  };

  // Handle video playback
  const handlePlayVideo = (quizId: string) => {
    const video = quizVideos.find(v => v.quizId === quizId);
    if (video) {
      setCurrentVideo(video);
      setShowVideoModal(true);
      setIsPlaying(false);
    }
  };

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Format time for video player (converts seconds to MM:SS format)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !selectedQuiz) return;

    // Reset states
    setUploadProgress({
      percent: 0,
      loaded: 0,
      total: file.size,
      speed: 0,
      timeRemaining: null
    });
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    // Validate file type
    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      setErrorMessage('Please upload a valid video file (MP4 or WebM)');
      setUploadStatus('error');
      setIsUploading(false);
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('File size should not exceed 100MB');
      setUploadStatus('error');
      setIsUploading(false);
      return;
    }

    try {
      console.log('[AdminQuizVideoUpload] Starting video upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        quizId: selectedQuiz.id
      });

      // Check if this quiz already has a video
      const existingVideo = quizVideos.find(video => video.quizId === selectedQuiz.id);

      if (existingVideo) {
        // Update existing video using direct Firebase Storage
        await firebaseStorageService.updateQuizVideo(selectedQuiz.id, file);
        toast.success('Video updated successfully!');
      } else {
        // Upload new video using direct Firebase Storage
        await firebaseStorageService.uploadQuizVideo(selectedQuiz.id, file);
        toast.success('Video uploaded successfully!');
      }

      setUploadStatus('success');
      setShowUploadModal(false);

      // Refresh the videos list
      fetchQuizVideos();
      } catch (error: unknown) {
        let errorMsg = 'Failed to upload video. Please try again.';
        if (typeof error === 'object' && error !== null) {
          const err = error as { message?: string; response?: { data?: { details?: string; error?: string }; status?: number } };
          console.error('[AdminQuizVideoUpload] Upload error:', err);
          if (err.response?.data?.details) {
            errorMsg = err.response.data.details;
          } else if (err.response?.data?.error) {
            errorMsg = err.response.data.error;
          }
          if (err.response?.status === 401) {
            errorMsg = 'Authentication failed. Please try refreshing the page and logging in again.';
          } else if (err.response?.status === 403) {
            errorMsg = 'You do not have permission to upload videos. Admin access is required.';
          }
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        setErrorMessage(errorMsg);
        setUploadStatus('error');
        toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (quizId: string) => {
    setQuizToDelete(quizId);
    setShowDeleteConfirmation(true);
  };

  // Confirm delete video
  const confirmDeleteVideo = async () => {
    if (!quizToDelete || !user) return;

    try {
      setIsDeleting(true);

      // Use direct Firebase Storage for deletion
      await firebaseStorageService.deleteQuizVideo(quizToDelete);

      // Update local state
      setQuizVideos(prevVideos => prevVideos.filter(video => video.quizId !== quizToDelete));

      toast.success('Video deleted successfully!');
      } catch (error: unknown) {
        let errorMsg = 'Error deleting video. Please try again.';
        if (typeof error === 'object' && error !== null) {
          const err = error as { message?: string; response?: { data?: { details?: string; error?: string }; status?: number } };
          console.error('[AdminQuizVideoUpload] Delete error:', err);
          if (err.response?.data?.details) {
            errorMsg = err.response.data.details;
          } else if (err.response?.data?.error) {
            errorMsg = err.response.data.error;
          }
          if (err.response?.status === 401) {
            errorMsg = 'Authentication failed. Please try refreshing the page and logging in again.';
          } else if (err.response?.status === 403) {
            errorMsg = 'You do not have permission to delete videos. Admin access is required.';
          }
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setQuizToDelete(null);
    }
  };

  // Format date for display
  const formatDate = (dateInput: unknown) => {
    if (!dateInput) return 'N/A';

    try {
      let date: Date;

      // Handle Firestore timestamp objects
      if (dateInput && typeof dateInput === 'object' && 'seconds' in dateInput) {
        // Convert Firestore timestamp to Date
        const seconds = (dateInput as { seconds: number }).seconds;
        date = new Date(seconds * 1000);
      } else if (typeof dateInput === 'string') {
        // Handle string dates
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        // Handle Date objects
        date = dateInput;
      } else {
        console.warn('[AdminQuizVideoUpload] Unknown date format:', dateInput);
        return 'Invalid date';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('[AdminQuizVideoUpload] Invalid date:', dateInput);
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('[AdminQuizVideoUpload] Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter and sort quizzes
  const filteredQuizzes = quizzes.filter(quiz =>
    (quiz.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (quiz.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Sort quizzes
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    if (sortField === 'title') {
      const titleA = a.title || '';
      const titleB = b.title || '';
      return sortDirection === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    }
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: 'title' | 'uploadedAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Check if a quiz has a video
  const hasVideo = (quizId: string) => {
    return quizVideos.some(video => video.quizId === quizId);
  };

  // Get video for a quiz
  const getVideoForQuiz = (quizId: string) => {
    return quizVideos.find(video => video.quizId === quizId);
  };

  // Check if user is admin by looking at the URL path
  // const isAdminPage = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard') &&
  //                    window.location.href.includes('adminquizvideos');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-800 mb-2">Quiz Video Management</h1>
        <p className="text-orange-600">
          Upload, manage, and delete videos for quizzes. Each quiz can have one associated video.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-orange-400" />
          </div>
          <input
            type="text"
            placeholder="Search quizzes..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-orange-700">Sort by:</span>
          <button
            onClick={() => toggleSort('title')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              sortField === 'title' ? 'bg-orange-100 text-orange-700' : 'text-gray-600'
            }`}
          >
            Title
            {sortField === 'title' && (
              sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {(isLoadingQuizzes || isLoadingVideos) && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Quiz List */}
      {!isLoadingQuizzes && !isLoadingVideos && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                    Video
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {sortedQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-orange-700">
                      <div className="flex flex-col items-center">
                        <AlertCircle size={48} className="text-orange-400 mb-3" />
                        <p className="text-lg font-medium">No quizzes found</p>
                        <p className="text-sm text-orange-600 mt-1">
                          {searchTerm ? "Try different search terms" : "Add quizzes to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedQuizzes.map((quiz) => {
                    const quizVideo = getVideoForQuiz(quiz.id);
                    return (
                      <tr key={quiz.id} className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-orange-800">{quiz.title}</div>
                          <div className="text-xs text-orange-600 mt-1 line-clamp-1">{quiz.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            quiz.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {quiz.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasVideo(quiz.id) ? (
                            <div className="flex items-center cursor-pointer" onClick={() => handlePlayVideo(quiz.id)}>
                              <Video size={16} className="text-orange-500 mr-2" />
                              <span className="text-sm text-orange-700 hover:text-orange-900 hover:underline">
                                {quiz.title || 'Video Available'} (Click to play)
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No video</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-orange-700">
                            {quizVideo ? formatDate(quizVideo.uploadedAt) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {hasVideo(quiz.id) ? (
                              <>
                                <button
                                  onClick={() => handlePlayVideo(quiz.id)}
                                  className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full text-blue-600 transition-colors"
                                  title="Play video"
                                >
                                  <Play size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedQuiz(quiz);
                                    setShowUploadModal(true);
                                  }}
                                  className="bg-orange-100 hover:bg-orange-200 p-2 rounded-full text-orange-600 transition-colors"
                                  title="Replace video"
                                >
                                  <RefreshCw size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(quiz.id)}
                                  className="bg-red-100 hover:bg-red-200 p-2 rounded-full text-red-600 transition-colors"
                                  title="Delete video"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedQuiz(quiz);
                                  setShowUploadModal(true);
                                }}
                                className="bg-orange-100 hover:bg-orange-200 p-2 rounded-full text-orange-600 transition-colors"
                                title="Upload video"
                              >
                                <Upload size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && selectedQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-orange-800">
                  {hasVideo(selectedQuiz.id) ? 'Replace Video' : 'Upload Video'}
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-orange-700 font-medium mb-1">Quiz:</p>
                <p className="text-gray-800">{selectedQuiz.title}</p>
              </div>

              {uploadStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="flex items-start">
                    <XCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors mb-4">
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="quiz-video-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="quiz-video-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center ${isUploading ? 'opacity-50' : ''}`}
                >
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-orange-500 mb-4 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-orange-500 mb-4" />
                  )}
                  <p className="text-orange-700 font-medium">
                    {isUploading ? 'Uploading...' : 'Click to upload video'}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    MP4 or WebM, max 100MB
                  </p>
                </label>
              </div>

              {isUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-orange-700 mb-1">
                    <span>{uploadProgress.percent}% complete</span>
                    <span>{formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}</span>
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-2.5">
                    <div
                      className="bg-orange-500 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress.percent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-50 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {showVideoModal && currentVideo && (
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
                  {currentVideo.quizTitle || 'Quiz Video'}
                </h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    if (videoRef.current) {
                      videoRef.current.pause();
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div
                ref={videoContainerRef}
                className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
              >
                <video
                  ref={videoRef}
                  src={currentVideo.videoUrl}
                  className="w-full h-full object-contain"
                  controls={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
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
                        onClick={togglePlay}
                        className="text-white hover:text-orange-300 transition-colors"
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-orange-300 transition-colors"
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <div className="text-white text-sm ml-3">
                        {formatFileSize(currentVideo.fileSize || 0)}
                      </div>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-orange-300 transition-colors"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Uploaded: {formatDate(currentVideo.uploadedAt)}</p>
                <p>File: {currentVideo.fileName}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-red-600">Confirm Deletion</h3>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isDeleting}
                >
                  <XCircle size={24} />
                </button>
              </div>

              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this video? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteVideo}
                  className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminQuizVideoUpload;
