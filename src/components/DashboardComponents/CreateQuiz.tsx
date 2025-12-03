import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Upload, Video, Trash2, Loader2 } from 'lucide-react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection,  query, orderBy,  updateDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { firebaseStorageService } from '@/services/firebaseStorageService';

interface CreateQuizProps {
  onQuizCreated?: () => void;
  quizToEdit?: {
    id: string;
    title: string;
    description: string;
    is_active: boolean;
    questions_list: Array<{ id: string; text: string; options: string[]; correctAnswer: string; category: string }>;
    startTime: string;
    endTime: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

interface QuizData {
  [key: string]: string | boolean | Array<{ id: string; text: string; options: string[]; correctAnswer: string; category: string }> | undefined;  // Add index signature
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  is_active: boolean;
  questions_list: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    category: string;
  }>;
  createdAt?: string;
  updatedAt: string;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

function CreateQuiz({ onQuizCreated, quizToEdit }: CreateQuizProps) {
  const [title, setTitle] = useState(quizToEdit?.title || '');
  const [description, setDescription] = useState(quizToEdit?.description || '');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(quizToEdit?.is_active ? 'true' : 'false');
  const [startTime, setStartTime] = useState<Date | null>(
    quizToEdit?.startTime ? new Date(quizToEdit.startTime) : new Date()
  );
  const [endTime, setEndTime] = useState<Date | null>(
    quizToEdit?.endTime ? new Date(quizToEdit.endTime) : new Date()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if quiz has a video
  useEffect(() => {
    const checkQuizVideo = async () => {
      if (quizToEdit?.id) {
        try {
          const videoDoc = await getDoc(doc(db, 'adminQuizVideos', quizToEdit.id));
          if (videoDoc.exists()) {
            const videoData = videoDoc.data();
            setVideoUrl(videoData.videoUrl);
          }
        } catch (error) {
          console.error('Error checking for quiz video:', error);
        }
      }
    };

    checkQuizVideo();
  }, [quizToEdit]);

  // Fetch existing questions for editing
  useEffect(() => {
    const fetchExistingQuestions = async () => {
      if (!quizToEdit?.questions_list) return;

      try {
        setLoading(true);
        const questionPromises = quizToEdit.questions_list.map(async (questionRef: { id: string; text: string; options: string[]; correctAnswer: string; category: string } | string) => {
          try {
            const qId = typeof questionRef === 'string' ? questionRef : questionRef.id;
            const questionDoc = await getDoc(doc(db, 'questions', qId));

            if (!questionDoc.exists()) {
              console.warn(`Question document not found: ${qId}`);
              return null;
            }

            const data = questionDoc.data();
            return {
              id: questionDoc.id,
              questionText: data.text || data.questionText || '',
              options: data.options || [],
              correctAnswer: data.correctAnswer || '',
              category: data.category || ''
            } as Question;
          } catch (err) {
            console.error('Error fetching question:', err);
            return null;
          }
        });

        const fetchedQuestions = await Promise.all(questionPromises);
        const validQuestions = fetchedQuestions.filter((q) => q !== null);
        setSelectedQuestions(validQuestions);
        console.log('[CreateQuiz] Loaded existing questions:', validQuestions);
      } catch (error) {
        console.error('Error fetching existing questions:', error);
        toast.error('Failed to load existing questions');
      } finally {
        setLoading(false);
      }
    };

    fetchExistingQuestions();
  }, [quizToEdit]);

  // Fetch questions when modal opens
  useEffect(() => {
    if (!openModal) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
    const questionsQuery = query(
      collection(db, 'questions'),
      orderBy('createdAt', 'desc')
    );

        const querySnapshot = await getDocs(questionsQuery);
        const fetchedQuestions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          questionText: doc.data().text || doc.data().questionText || '',
          options: doc.data().options || [],
          correctAnswer: doc.data().correctAnswer || '',
          category: doc.data().category || ''
        })) as Question[];

        setQuestions(fetchedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [openModal]);

  // Handle video file selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      toast.error('Please upload a valid video file (MP4 or WebM)');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size should not exceed 100MB');
      return;
    }

    setVideoFile(file);
  };

  // Handle video upload
  const handleVideoUpload = async () => {
    if (!videoFile) return;

    // For new quizzes, we'll store the video file and upload it when the quiz is created
    if (!quizToEdit?.id) {
      toast.info('Video will be uploaded when you save the quiz');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload video for existing quiz
      const result = await firebaseStorageService.uploadQuizVideo(quizToEdit.id, videoFile);

      setVideoUrl(result.videoUrl);
      toast.success('Video uploaded successfully!');
      setVideoFile(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle video removal
  const handleRemoveVideo = async () => {
    if (!quizToEdit?.id) return;

    try {
      await firebaseStorageService.deleteQuizVideo(quizToEdit.id);
      setVideoUrl('');
      toast.success('Video removed successfully!');
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video. Please try again.');
    }
  };

  // Handle creating/updating the quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input fields
      if (!title.trim() || !description.trim() || !startTime || !endTime || selectedQuestions.length === 0) {
        toast.error('Please fill in all fields and select at least one question');
        setLoading(false);
        return;
      }

      // Validate that end time is after start time
      if (endTime <= startTime) {
        toast.error('End time must be after start time');
        setLoading(false);
      return;
    }

      // Format the times properly
      let formattedStartTime: string;
      let formattedEndTime: string;
      try {
        formattedStartTime = startTime.toISOString();
        formattedEndTime = endTime.toISOString();
      } catch (error) {
        console.error('Error formatting times:', error);
        throw new Error('Invalid time format');
      }

      // Prepare questions with detailed information
      const questionsWithDetails = selectedQuestions.map(question => {
        if (!question || !question.id) {
          console.error('Invalid question data:', question);
          return null;
        }
        return {
          id: question.id,
          text: question.questionText || '',
          options: question.options || [],
          correctAnswer: question.correctAnswer || '',
          category: question.category || ''
        };
      }).filter(Boolean) as QuizData['questions_list'];

      if (questionsWithDetails.length === 0) {
        throw new Error('No valid questions selected');
      }

      // Structure the quiz data
      const quizData: QuizData = {
        title: title.trim(),
        description: description.trim(),
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        is_active: status === 'true',
        questions_list: questionsWithDetails,
        updatedAt: new Date().toISOString()
      };

      // Only include createdAt for new quizzes
      if (!quizToEdit?.id) {
        quizData.createdAt = new Date().toISOString();
      }

      console.log('[CreateQuiz] Saving quiz data:', quizData);

      if (quizToEdit?.id) {
        // Update existing quiz
        console.log('[CreateQuiz] Updating quiz:', quizToEdit.id);
        const quizRef = doc(db, 'quizzes', quizToEdit.id);
        await updateDoc(quizRef, { ...quizData });  // Spread the quizData object
        toast.success('Quiz updated successfully!');
      } else {
        // Create new quiz
        console.log('[CreateQuiz] Creating new quiz');
        // const quizRef = await addDoc(collection(db, 'quizzes'), quizData);
        toast.success('Quiz created successfully!');
      }

      // Reset form fields
      setTitle('');
      setDescription('');
      setStartTime(null);
      setEndTime(null);
      setSelectedQuestions([]);
      setStatus('false');
      setSearchQuery('');
      setCurrentPage(1);
      setQuestions([]);
      setOpenModal(false);

      // Call the callback if provided
      if (onQuizCreated) {
        onQuizCreated();
      }
    } catch (error) {
      console.error('[CreateQuiz] Error saving quiz:', error);
      toast.error('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on search query
  const filteredQuestions = questions.filter(question => {
    if (!question || !question.questionText) return false;
    return question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (question.correctAnswer && question.correctAnswer.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Handle question selection
  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestions(prev => {
      const isSelected = prev.some(q => q.id === question.id);
      if (isSelected) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

  return (
    <div className="p-6 relative bg-orange-50 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-orange-800 mb-6">
        {quizToEdit ? 'Edit Quiz' : 'Create a New Quiz'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleCreateQuiz} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-orange-800 mb-2" htmlFor="title">
            Quiz Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-colors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-orange-800 mb-2" htmlFor="description">
            Quiz Description
          </label>
          <textarea
            id="description"
            className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-colors"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            rows={3}
          />
        </div>

        {/* Date and Time Picker and Status Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date and Time Pickers */}
          <div className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-orange-800 mb-2" htmlFor="startTime">
                Start Time
            </label>
              <DatePicker
                id="startTime"
                selected={startTime}
                onChange={(date: Date | null) => setStartTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                maxDate={endTime || undefined}
                className="w-full p-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholderText="Select start date and time"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-2" htmlFor="endTime">
                End Time
              </label>
              <DatePicker
                id="endTime"
                selected={endTime}
                onChange={(date: Date | null) => setEndTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={startTime || new Date()}
                className="w-full p-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholderText="Select end date and time"
              />
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-orange-800 mb-2" htmlFor="status">
              Status
            </label>
            <ToggleButtonGroup
              value={status}
              exclusive
              onChange={(e, newStatus) => setStatus(newStatus)}
              aria-label="Status"
              className="w-full"
              sx={{
                '& .MuiToggleButton-root': {
                  color: '#f97316',
                  borderColor: '#fcd34d',
                  '&.Mui-selected': {
                    backgroundColor: '#f97316',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#ea580c',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="true" aria-label="Active" className="w-full">
                Active
              </ToggleButton>
              <ToggleButton value="false" aria-label="Inactive" className="w-full">
                Inactive
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        {/* Video Upload Section */}
        
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <h3 className="text-lg font-medium text-orange-800 mb-2">Quiz Video</h3>
            <p className="text-sm text-orange-600 mb-4">
              Upload a video for this quiz. Only one video per quiz is allowed.
            </p>

            {videoUrl ? (
              <div className="mb-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    disabled={loading || isUploading || !quizToEdit?.id}
                  >
                    <Trash2 size={16} />
                    Remove Video
                  </button>
                </div>
              </div>
            ) : videoFile ? (
              <div className="mb-4">
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                  <p className="text-orange-700 font-medium mb-2">{videoFile.name}</p>
                  <p className="text-sm text-orange-600 mb-4">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-orange-500 mb-2 animate-spin" />
                      <p className="text-orange-700">Uploading... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      {quizToEdit?.id && (
                        <button
                          type="button"
                          onClick={handleVideoUpload}
                          className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          <Upload size={16} />
                          Upload Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {!quizToEdit?.id && (
                  <div className="mt-2 text-sm text-orange-600 bg-orange-100 p-2 rounded-lg">
                    <p>Video will be uploaded when you save the quiz.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoSelect}
                    className="hidden"
                    id="quiz-video-upload"
                    ref={fileInputRef}
                    disabled={loading || isUploading}
                  />

                  <label
                    htmlFor="quiz-video-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Video className="w-12 h-12 text-orange-500 mb-4" />
                    <p className="text-orange-700 font-medium">Click to select a video</p>
                    <p className="text-sm text-orange-600 mt-1">MP4 or WebM, max 100MB</p>
                  </label>
                </div>
              </div>
            )}
          </div>
        

        {/* Selected Questions Preview */}
          <div className="mt-6">
          <h3 className="text-lg font-medium text-orange-800 mb-4">
            Selected Questions ({selectedQuestions.length})
          </h3>
            <div className="space-y-3">
              {selectedQuestions.map((question) => (
                <div
                  key={question.id}
                  className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-orange-200 hover:border-orange-300 transition-colors"
                >
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">{question.questionText}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Answer: {question.correctAnswer}
                  </p>
                  <p className="text-sm text-gray-500">
                    Category: {question.category}
                  </p>
                </div>
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuestionSelect(question);
                  }}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        {/* Select Questions Button */}
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>{selectedQuestions.length > 0 ? 'Add More Questions' : 'Select Questions'}</span>
        </button>

        {/* Create Quiz Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              <span>{quizToEdit ? 'Updating Quiz...' : 'Creating Quiz...'}</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>{quizToEdit ? 'Update Quiz' : 'Create Quiz'}</span>
            </>
          )}
        </button>
      </form>

      {/* Modal to select questions */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-600">Select Questions</h3>
                <button
                onClick={() => setOpenModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" size={20} />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-t-2 border-orange-500 border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedQuestions.some(q => q.id === question.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-orange-200 hover:border-orange-300'
                    }`}
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-700 font-medium">{question.questionText}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Answer:</span> {question.correctAnswer}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {question.category}
                          </p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-600">Options:</span>
                              <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                                {question.options.map((option, i) => (
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
                    <button
                      className={`p-2 rounded-full transition-colors ${
                          selectedQuestions.some(q => q.id === question.id)
                          ? 'bg-orange-500 text-white'
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      }`}
                    >
                        {selectedQuestions.some(q => q.id === question.id) ? (
                        <X size={20} />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;
