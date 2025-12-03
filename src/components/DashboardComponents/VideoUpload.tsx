import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Play,
  Maximize,
  Volume2,
  VolumeX,
  Pause,
  Minimize,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

interface VideoUploadProps {
  userData: {
    name: string;
    email: string;
    phone: string;
  };
}

interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  attemptDate: string;
  registerDate: string;
  result: number;
  status: string;
}

interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
  speed: number;
  timeRemaining: number | null;
}

interface ExistingVideo {
  videoUrl: string;
  uploadedAt: string;
  fileName: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ userData }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percent: 0,
    loaded: 0,
    total: 0,
    speed: 0,
    timeRemaining: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [existingVideo, setExistingVideo] = useState<ExistingVideo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  // Video player state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // User quiz data
  const [userQuizzes, setUserQuizzes] = useState<{
    attempted: QuizAttempt[];
    registered: {
      quizId: string;
      quizTitle: string;
      status: string;
      registerDate: string;
    }[];
  }>({ attempted: [], registered: [] });

  // Unified date formatter that handles all cases
  // const formatDate = (dateInput: any): string => {
  //   if (!dateInput) return 'Unknown';

  //   try {
  //     let date: Date;

  //     // Handle Firestore Timestamp
  //     if (dateInput instanceof Timestamp) {
  //       date = dateInput.toDate();
  //     }
  //     // Handle Firestore object format
  //     else if (typeof dateInput === 'object' && 'seconds' in dateInput) {
  //       date = new Date(dateInput.seconds * 1000);
  //     }
  //     // Handle string date
  //     else if (typeof dateInput === 'string') {
  //       date = new Date(dateInput);
  //     }
  //     // Handle Date object
  //     else if (dateInput instanceof Date) {
  //       date = dateInput;
  //     }
  //     else {
  //       return 'Invalid date';
  //     }

  //     if (isNaN(date.getTime())) {
  //       return 'Invalid date';
  //     }

  //     return date.toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     });
  //   } catch (error) {
  //     console.error('Error formatting date:', error);
  //     return 'Invalid date';
  //   }
  // };

  // ✅ FIXED: formatDate parameter type changed from 'any' to 'unknown'
  // const formatDate = (dateInput: unknown): string => {
  //   if (!dateInput) return "Unknown";

  //   try {
  //     let date: Date;

  //     // Handle Firestore Timestamp
  //     if (dateInput instanceof Timestamp) {
  //       date = dateInput.toDate();
  //     }
  //     // Handle Firestore object format
  //     else if (
  //       typeof dateInput === "object" &&
  //       dateInput !== null &&
  //       "seconds" in dateInput
  //     ) {
  //       date = new Date((dateInput as any).seconds * 1000);
  //     }
  //     // Handle string date
  //     else if (typeof dateInput === "string") {
  //       date = new Date(dateInput);
  //     }
  //     // Handle Date object
  //     else if (dateInput instanceof Date) {
  //       date = dateInput;
  //     } else {
  //       return "Invalid date";
  //     }

  //     if (isNaN(date.getTime())) {
  //       return "Invalid date";
  //     }

  //     return date.toLocaleDateString("en-US", {
  //       year: "numeric",
  //       month: "short",
  //       day: "numeric",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //   } catch (error) {
  //     console.error("Error formatting date:", error);
  //     return "Invalid date";
  //   }
  // };

  const formatDate = (dateInput: unknown): string => {
  if (!dateInput) return "Unknown";

  try {
    let date: Date;

    // Handle Firestore Timestamp
    if (dateInput instanceof Timestamp) {
      date = dateInput.toDate();
    }
    // Handle Firestore object format
    else if (
      typeof dateInput === "object" &&
      dateInput !== null &&
      "seconds" in dateInput &&
      typeof (dateInput as Record<string, unknown>).seconds === "number"
    ) {
      // ✅ FIXED: Type-safe access without 'any'
      date = new Date((dateInput as Record<string, number>).seconds * 1000);
    }
    // Handle string date
    else if (typeof dateInput === "string") {
      date = new Date(dateInput);
    }
    // Handle Date object
    else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return "Invalid date";
    }

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error: unknown) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};


  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600)
      return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round(
      (seconds % 3600) / 60
    )}m`;
  };

  // Check for existing video
  // const checkExistingVideo = async () => {
  //   if (!user) return;

  //   try {
  //     setIsLoading(true);
  //     const token = await user.getIdToken();
  //     const response = await axios.get(`https://hindutva-backend-jwh8.onrender.com/videos/${user.uid}`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     if (response.data) {
  //       setExistingVideo({
  //         videoUrl: response.data.videoUrl,
  //         uploadedAt: response.data.uploadedAt,
  //         fileName: response.data.fileName
  //       });
  //       setVideoUrl(response.data.videoUrl);
  //     }
  //   } catch (error: any) {
  //     console.error('[VideoUpload] Error checking existing video:', error);
  //     if (error.response?.status !== 404) {
  //       toast.error('Error checking video status');
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ✅ FIXED: checkExistingVideo wrapped in useCallback
  // const checkExistingVideo = useCallback(async () => {
  //   if (!user) return;

  //   try {
  //     setIsLoading(true);
  //     const token = await user.getIdToken();
  //     const response = await axios.get(
  //       `https://hindutva-backend-jwh8.onrender.com/videos/${user.uid}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data) {
  //       setExistingVideo({
  //         videoUrl: response.data.videoUrl,
  //         uploadedAt: response.data.uploadedAt,
  //         fileName: response.data.fileName,
  //       });
  //       setVideoUrl(response.data.videoUrl);
  //     }
  //   } catch (error: unknown) {
  //     // ✅ FIXED: any → unknown
  //     console.error("[VideoUpload] Error checking existing video:", error);
  //     // const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  //     if ((error as any)?.response?.status !== 404) {
  //       toast.error("Error checking video status");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [user]);

  const checkExistingVideo = useCallback(async () => {
  if (!user) return;

  try {
    setIsLoading(true);
    const token = await user.getIdToken();
    const response = await axios.get(
      `https://hindutva-backend-jwh8.onrender.com/videos/${user.uid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      setExistingVideo({
        videoUrl: response.data.videoUrl,
        uploadedAt: response.data.uploadedAt,
        fileName: response.data.fileName,
      });
      setVideoUrl(response.data.videoUrl);
    }
  } catch (error: unknown) {
    console.error("[VideoUpload] Error checking existing video:", error);
    
    // ✅ FIXED: Safe type narrowing without 'any'
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status !== 404) {
      toast.error("Error checking video status");
    }
  } finally {
    setIsLoading(false);
  }
}, [user]);


  useEffect(() => {
    checkExistingVideo();
    fetchUserQuizzes();
  }, [user]);

  // Fetch user quiz data
  // const fetchUserQuizzes = async () => {
  //   if (!user) return;

  //   try {
  //     // Get all opted quizzes for the user
  //     const optedQuizzesRef = collection(db, 'optedQuizzes');
  //     const optedQuizzesQuery = query(
  //       optedQuizzesRef,
  //       where('userId', '==', user.uid)
  //     );
  //     const optedQuizzesSnapshot = await getDocs(optedQuizzesQuery);

  //     // Process all opted quizzes
  //     const quizPromises = optedQuizzesSnapshot.docs.map(async (optedDoc) => {
  //       const optedData = optedDoc.data();
  //       const quizDoc = await getDoc(doc(db, 'quizzes', optedData.quizId));
  //       const quizData = quizDoc.exists() ? quizDoc.data() : null;

  //       return {
  //         quizId: optedData.quizId,
  //         quizTitle: quizData?.title || 'Unknown Quiz',
  //         attemptDate: formatDate(optedData.attemptDate),
  //         registerDate: formatDate(optedData.registerDate || optedData.createdAt),
  //         result: optedData.result,
  //         status: optedData.status
  //       };
  //     });

  //     const quizzes = await Promise.all(quizPromises);

  //     // Separate attempted and registered quizzes
  //     const attemptedQuizzes = quizzes.filter(q => q.status === 'Completed' && q.result !== null);
  //     const registeredQuizzes = quizzes.map(q => ({
  //       quizId: q.quizId,
  //       quizTitle: q.quizTitle,
  //       status: q.status,
  //       registerDate: q.registerDate
  //     }));

  //     setUserQuizzes({
  //       attempted: attemptedQuizzes,
  //       registered: registeredQuizzes
  //     });

  //   } catch (error) {
  //     console.error('[VideoUpload] Error fetching user quizzes:', error);
  //   }
  // };

  // ✅ FIXED: fetchUserQuizzes wrapped in useCallback
  const fetchUserQuizzes = useCallback(async () => {
    if (!user) return;

    try {
      // Get all opted quizzes for the user
      const optedQuizzesRef = collection(db, "optedQuizzes");
      const optedQuizzesQuery = query(
        optedQuizzesRef,
        where("userId", "==", user.uid)
      );
      const optedQuizzesSnapshot = await getDocs(optedQuizzesQuery);

      // Process all opted quizzes
      const quizPromises = optedQuizzesSnapshot.docs.map(async (optedDoc) => {
        const optedData = optedDoc.data();
        const quizDoc = await getDoc(doc(db, "quizzes", optedData.quizId));
        const quizData = quizDoc.exists() ? quizDoc.data() : null;

        return {
          quizId: optedData.quizId,
          quizTitle: quizData?.title || "Unknown Quiz",
          attemptDate: formatDate(optedData.attemptDate),
          registerDate: formatDate(
            optedData.registerDate || optedData.createdAt
          ),
          result: optedData.result,
          status: optedData.status,
        };
      });

      const quizzes = await Promise.all(quizPromises);

      // Separate attempted and registered quizzes
      const attemptedQuizzes = quizzes.filter(
        (q) => q.status === "Completed" && q.result !== null
      );
      const registeredQuizzes = quizzes.map((q) => ({
        quizId: q.quizId,
        quizTitle: q.quizTitle,
        status: q.status,
        registerDate: q.registerDate,
      }));

      setUserQuizzes({
        attempted: attemptedQuizzes,
        registered: registeredQuizzes,
      });
    } catch (error: unknown) {
      // ✅ FIXED: implicit any → unknown
      console.error("[VideoUpload] Error fetching user quizzes:", error);
    }
  }, [user]);

  // Format time for video player
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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

  // Fetch user info from Firestore if needed
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({
            name: data.name || user.displayName || "",
            email: data.email || user.email || "",
          });
        }
      } catch (error) {
        console.error("[VideoUpload] Error fetching user info:", error);
      }
    };

    if (!userData?.name || !userData?.email) {
      fetchUserInfo();
    }
  }, [user, userData]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Reset states
    setUploadProgress({
      percent: 0,
      loaded: 0,
      total: file.size,
      speed: 0,
      timeRemaining: null,
    });
    setIsUploading(true);
    setUploadStatus("idle");
    setErrorMessage("");

    // Validate file type
    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setErrorMessage("Please upload a valid video file (MP4 or WebM)");
      setUploadStatus("error");
      setIsUploading(false);
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File size should not exceed 100MB");
      setUploadStatus("error");
      setIsUploading(false);
      return;
    }

    // Use userInfo if available, otherwise fall back to userData
    const name = userInfo?.name || userData?.name || user.displayName || "";
    const email = userInfo?.email || userData?.email || user.email || "";

    if (!name || !email) {
      setErrorMessage("Unable to get user information. Please try again.");
      setUploadStatus("error");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("userId", user.uid);
    formData.append("userName", name);
    formData.append("userEmail", email);

    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      const token = await user.getIdToken();

      console.log("[VideoUpload] Starting video upload:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userData: {
          userId: user.uid,
          userName: name,
          userEmail: email,
        },
      });

      // Determine if this is a new upload or an update
      const isUpdate = existingVideo !== null;
      const endpoint = isUpdate
        ? `https://hindutva-backend-jwh8.onrender.com/videos/${user.uid}/update`
        : "https://hindutva-backend-jwh8.onrender.com/videos/upload";
      const method = isUpdate ? "PUT" : "POST";

      console.log(`[VideoUpload] Using ${method} request to ${endpoint}`);

      const response = await axios({
        method,
        url: endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const now = Date.now();
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || file.size;
          const timeElapsed = (now - lastTime) / 1000; // in seconds
          const bytesUploaded = loaded - lastLoaded;
          const speed = bytesUploaded / timeElapsed; // bytes per second
          const remainingBytes = total - loaded;
          const timeRemaining = speed > 0 ? remainingBytes / speed : null;

          setUploadProgress({
            percent: Math.round((loaded / total) * 100),
            loaded,
            total,
            speed,
            timeRemaining,
          });

          lastLoaded = loaded;
          lastTime = now;
        },
        timeout: 300000, // 5 minutes
      });

      console.log("[VideoUpload] Upload successful:", response.data);
      setVideoUrl(response.data.videoUrl);
      setExistingVideo({
        videoUrl: response.data.videoUrl,
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
      });
      setUploadStatus("success");
      toast.success(
        isUpdate
          ? "Video updated successfully!"
          : "Video uploaded successfully!"
      );
    } 
    
    catch (error: unknown) {
  console.error("[VideoUpload] Upload error:", error);

  let errorMsg = "Error uploading video. Please try again.";

  // ✅ FIXED: Define AxiosError interface without 'any'
  interface AxiosErrorResponse {
    status?: number;
    data?: {
      error?: string;
      details?: string;
    };
  }

  interface AxiosError {
    response?: AxiosErrorResponse;
  }

  // Type-safe error narrowing
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    const response = axiosError.response;

    console.error("[VideoUpload] Upload error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: response?.status,
      responseData: response?.data,
    });

    if (response?.data?.error) {
      errorMsg = response.data.error;
    } else if (response?.data?.details) {
      errorMsg = response.data.details;
    } else if (response?.status === 401) {
      errorMsg = "Authentication failed. Please try logging in again.";
    } else if (response?.status === 413) {
      errorMsg = "File size too large. Please upload a smaller video.";
    } else if (response?.status === 409) {
      errorMsg = "Error updating video. Please try again.";
    } else if (response?.status === 500) {
      errorMsg = `Server error: ${response.data?.details || "Please try again later."}`;
    }
  }

  setErrorMessage(errorMsg);
  setUploadStatus("error");
  toast.error(errorMsg);
}

    finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!user || !existingVideo) return;

    // Show confirmation toast with Yes/No buttons
    const toastId = toast.warning(
      <div className="flex flex-col items-center">
        <p className="mb-4">Are you sure you want to delete this video?</p>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={async () => {
              try {
                setIsDeleting(true);
                const token = await user.getIdToken();
                await axios.delete(
                  `https://hindutva-backend-jwh8.onrender.com/videos/${user.uid}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                setExistingVideo(null);
                setVideoUrl(null);
                toast.dismiss(toastId);
                toast.success("Video deleted successfully!");
              } catch (error: unknown) {
                if (error instanceof Error) {
                  console.error("[VideoUpload] Delete error:", error.message);
                  toast.error(`Error deleting video: ${error.message}`);
                } else {
                  console.error("[VideoUpload] Delete error:", error);
                  toast.error("Error deleting video. Please try again.");
                }
              } finally {
                setIsDeleting(false);
              }
            }}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => toast.dismiss(toastId)}
          >
            No
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: true,
        theme: "light",
      }
    );
  };

  const handleReplaceVideo = () => {
    // Trigger file input click
    const fileInput = document.getElementById(
      "video-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h2 className="text-2xl font-semibold text-orange-800 mb-4">
          Your Video
        </h2>

        {existingVideo ? (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-orange-800">Current Video</h3>
                  <div className="mt-2 text-sm text-orange-600">
                    <p>File: {existingVideo.fileName}</p>
                    <p>Uploaded: {formatDate(existingVideo.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReplaceVideo}
                    className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                    disabled={isDeleting}
                  >
                    <RefreshCw
                      size={20}
                      className={isUploading ? "animate-spin" : ""}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteVideo}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-orange-800 mb-2">
                Video Preview
              </h3>
              <div className="relative group">
                <video
                  src={existingVideo.videoUrl}
                  className="w-full rounded-lg shadow-md cursor-pointer"
                  onClick={() => setShowVideoModal(true)}
                />
                <div
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                  onClick={() => setShowVideoModal(true)}
                >
                  <div className="bg-orange-500 rounded-full p-4 text-white">
                    <Play size={24} />
                  </div>
                </div>
              </div>
            </div>

            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleFileUpload}
              className="hidden"
              id="video-upload"
              disabled={isUploading || isDeleting}
            />

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-orange-100 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-orange-600">
                  <span>{uploadProgress.percent}% uploaded</span>
                  <span>
                    {formatBytes(uploadProgress.loaded)} of{" "}
                    {formatBytes(uploadProgress.total)}
                  </span>
                </div>
                {uploadProgress.speed > 0 && (
                  <div className="flex justify-between text-sm text-orange-600 mt-1">
                    <span>Speed: {formatBytes(uploadProgress.speed)}/s</span>
                    {uploadProgress.timeRemaining && (
                      <span>
                        Time remaining:{" "}
                        {formatTimeRemaining(uploadProgress.timeRemaining)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="video-upload"
                className={`cursor-pointer flex flex-col items-center justify-center ${
                  isUploading ? "opacity-50" : ""
                }`}
              >
                {isUploading ? (
                  <Loader2 className="w-12 h-12 text-orange-500 mb-4 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-orange-500 mb-4" />
                )}
                <p className="text-orange-700 font-medium">
                  {isUploading ? "Uploading..." : "Click to upload video"}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  MP4 or WebM, max 100MB
                </p>
              </label>
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-orange-100 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-orange-600">
                  <span>{uploadProgress.percent}% uploaded</span>
                  <span>
                    {formatBytes(uploadProgress.loaded)} of{" "}
                    {formatBytes(uploadProgress.total)}
                  </span>
                </div>
                {uploadProgress.speed > 0 && (
                  <div className="flex justify-between text-sm text-orange-600 mt-1">
                    <span>Speed: {formatBytes(uploadProgress.speed)}/s</span>
                    {uploadProgress.timeRemaining && (
                      <span>
                        Time remaining:{" "}
                        {formatTimeRemaining(uploadProgress.timeRemaining)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {uploadStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <p className="text-green-700">Video uploaded successfully!</p>
              </motion.div>
            )}

            {uploadStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 rounded-lg flex items-center gap-3"
              >
                <XCircle className="w-6 h-6 text-red-500" />
                <p className="text-red-700">{errorMessage}</p>
              </motion.div>
            )}

            {videoUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-orange-800 mb-2">
                  Video Preview
                </h3>
                <div className="relative group">
                  <video
                    src={videoUrl}
                    className="w-full rounded-lg shadow-md cursor-pointer"
                    onClick={() => setShowVideoModal(true)}
                  />
                  <div
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                    onClick={() => setShowVideoModal(true)}
                  >
                    <div className="bg-orange-500 rounded-full p-4 text-white">
                      <Play size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Quiz Attempts Section */}
      {(userQuizzes.attempted.length > 0 ||
        userQuizzes.registered.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-orange-800 mb-6">
            Your Quiz Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attempted Quizzes */}
            <div>
              <h3 className="text-lg font-medium text-orange-700 mb-4">
                Completed Quizzes
              </h3>
              {userQuizzes.attempted.length > 0 ? (
                <div className="space-y-4">
                  {userQuizzes.attempted.map((quiz, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 p-4 rounded-lg border border-orange-100"
                    >
                      <div className="font-medium text-orange-800">
                        {quiz.quizTitle}
                      </div>
                      <div className="text-sm text-orange-600 mt-1">
                        Score: {quiz.result}%
                      </div>
                      <div className="text-sm text-orange-600">
                        Completed: {quiz.attemptDate}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-orange-600 italic">
                  No completed quizzes yet
                </p>
              )}
            </div>

            {/* Registered Quizzes */}
            <div>
              <h3 className="text-lg font-medium text-orange-700 mb-4">
                Registered Quizzes
              </h3>
              {userQuizzes.registered.length > 0 ? (
                <div className="space-y-4">
                  {userQuizzes.registered.map((quiz, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 p-4 rounded-lg border border-orange-100"
                    >
                      <div className="font-medium text-orange-800">
                        {quiz.quizTitle}
                      </div>
                      <div className="text-sm text-orange-600 mt-1">
                        Status: {quiz.status}
                      </div>
                      <div className="text-sm text-orange-600">
                        Registered: {quiz.registerDate}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-orange-600 italic">No registered quizzes</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

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
                  Your Quiz Video
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
                className={`relative bg-black rounded-lg overflow-hidden ${
                  isFullscreen ? "fixed inset-0 z-50" : ""
                }`}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
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
                        {isMuted ? (
                          <VolumeX size={20} />
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-orange-300 transition-colors"
                    >
                      {isFullscreen ? (
                        <Minimize size={20} />
                      ) : (
                        <Maximize size={20} />
                      )}
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

export default VideoUpload;
