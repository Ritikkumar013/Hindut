import { useEffect, useState, useCallback, useRef } from "react";
import CreateUser from "./CreateUser";
import UpdateUser from "./UpdateUser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle,
  UserCircle,
  Mail,
  Phone,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Upload,
  CheckCircle2,
  RefreshCw,
  Play,
  Maximize,
  Volume2,
  VolumeX,
  Pause,
  Minimize,
  Video,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  attemptDate: string;
  registerDate: string;
  result: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  videoUrl?: string;
  videoUploadedAt?: string;
  videoFileName?: string;
  quizActivity?: {
    attempted: QuizAttempt[];
    registered: {
      quizId: string;
      quizTitle: string;
      status: string;
      registerDate: string;
    }[];
  };
}

interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
  speed: number;
  timeRemaining: number | null;
}

const UserTable = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);

  // Video related states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percent: 0,
    loaded: 0,
    total: 0,
    speed: 0,
    timeRemaining: null,
  });
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Video player state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Utility functions for video handling
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600)
      return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round(
      (seconds % 3600) / 60
    )}m`;
  };

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

  // Format date for display
  const formatDate = (dateInput: unknown): string => {
    if (!dateInput) return "Unknown";

    try {
      let date: Date;

      // Handle different date formats
      if (
        typeof dateInput === "object" &&
        dateInput !== null &&
        "seconds" in dateInput
      ) {
        const ts = dateInput as { seconds: number };
        date = new Date(ts.seconds * 1000);
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
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
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Check for existing video
  // This function should not use hooks, only plain logic
  const checkExistingVideo = async (userId: string) => {
    if (!user) return null;
    try {
      const token = await user.getIdToken();
      const response = await axios.get(
        `https://hindutva-backend-jwh8.onrender.com/videos/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        return {
          videoUrl: response.data.videoUrl,
          videoUploadedAt: response.data.uploadedAt,
          videoFileName: response.data.fileName,
        };
      }
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("[Users] Error checking existing video:", error);
      }
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status: number } };
        if (err.response?.status !== 404) {
          toast.error("Error checking video status");
        }
      }
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    userId: string,
    userName: string,
    userEmail: string
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

    const formData = new FormData();
    formData.append("video", file);
    formData.append("userId", userId);
    formData.append("userName", userName);
    formData.append("userEmail", userEmail);

    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      const token = await user.getIdToken();

      console.log("[Users] Starting video upload:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userData: {
          userId: userId,
          userName: userName,
          userEmail: userEmail,
        },
      });

      // Check if this is an update or new upload
      const existingVideo = await checkExistingVideo(userId);
      const isUpdate = existingVideo !== null;
      const endpoint = isUpdate
        ? `https://hindutva-backend-jwh8.onrender.com/videos/${userId}/update`
        : "https://hindutva-backend-jwh8.onrender.com/videos/upload";
      const method = isUpdate ? "PUT" : "POST";

      console.log(`[Users] Using ${method} request to ${endpoint}`);

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

      console.log("[Users] Upload successful:", response.data);

      // Update the user in the list with the new video info
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              videoUrl: response.data.videoUrl,
              videoUploadedAt: new Date().toISOString(),
              videoFileName: `${userName}.${file.name.split(".").pop()}`,
            };
          }
          return u;
        })
      );

      setUploadStatus("success");
      toast.success(
        isUpdate
          ? "Video updated successfully!"
          : "Video uploaded successfully!"
      );
    } catch (error: unknown) {
      let errorMsg = "Error uploading video. Please try again.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as {
          message?: string;
          response?: {
            data?: { error?: string; details?: string };
            status?: number;
          };
        };
        console.error("[Users] Upload error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        if (err.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.response?.data?.details) {
          errorMsg = err.response.data.details;
        } else if (err.response?.status === 401) {
          errorMsg = "Authentication failed. Please try logging in again.";
        } else if (err.response?.status === 413) {
          errorMsg = "File size too large. Please upload a smaller video.";
        } else if (err.response?.status === 409) {
          errorMsg = "Error updating video. Please try again.";
        } else if (err.response?.status === 500) {
          errorMsg = `Server error: ${
            err.response?.data?.details || "Please try again later."
          }`;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
      setUploadStatus("error");
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (userId: string) => {
    if (!user) return;

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
                  `https://hindutva-backend-jwh8.onrender.com/videos/${userId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                // Update the user in the list to remove video info
                setUsers((prevUsers) =>
                  prevUsers.map((u) => {
                    if (u.id === userId) {
                      const {
                        videoUrl,
                        videoUploadedAt,
                        videoFileName,
                        ...rest
                      } = u;
                      void videoUrl;
                      void videoUploadedAt;
                      void videoFileName;
                      return rest;
                    }
                    return u;
                  })
                );

                toast.dismiss(toastId);
                toast.success("Video deleted successfully!");
              } catch (error: unknown) {
                if (error instanceof Error) {
                  console.error("[Users] Delete error:", error);
                } else {
                  console.error("[Users] Delete error:", error);
                }
                toast.error("Error deleting video. Please try again.");
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

  const setupUsers = useCallback(async () => {
    try {
      // Create a query with ordering
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      );

      // Set up real-time listener with caching
      const unsubscribe = onSnapshot(
        usersQuery,
        async (snapshot) => {
          const fetchedUsers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[];

          console.log("Fetched users:", fetchedUsers.length);

          // Check for videos for each user
          const usersWithVideos = await checkVideosForUsers(fetchedUsers);

          setUsers(usersWithVideos);
          setFilteredUsers(usersWithVideos);
          setLoading(false);
        },
        (error) => {
          console.error("Snapshot error:", error);
          setError("Failed to load users");
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error in setupUsers:", error);
      setError("Failed to load users");
      setLoading(false);
    }
  }, [user]);

  // Fetch quiz activity for a user
  const fetchUserQuizActivity = async (userId: string) => {
    try {
      // Get all opted quizzes for the user
      const optedQuizzesRef = collection(db, "optedQuizzes");
      const optedQuizzesQuery = query(
        optedQuizzesRef,
        where("userId", "==", userId)
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

      return {
        attempted: attemptedQuizzes,
        registered: registeredQuizzes,
      };
    } catch (error) {
      console.error(
        `[Users] Error fetching quiz activity for user ${userId}:`,
        error
      );
      return { attempted: [], registered: [] };
    }
  };

  // Check for videos for all users - optimized with batching
  const checkVideosForUsers = async (users: User[]) => {
    if (!user) return users;

    try {
      // First, just return the basic user data to show the table quickly
      setUsers(users);
      setFilteredUsers(users);

      // Then load additional data in the background
      const token = await user.getIdToken();

      // Process users in batches of 5 to avoid too many parallel requests
      const batchSize = 5;
      const updatedUsers = [...users];

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        // Process this batch in parallel
        const batchResults = await Promise.all(
          batch.map(async (user) => {
            try {
              // Fetch video data
              let updatedUser = { ...user };

              try {
                const response = await axios.get(
                  `https://hindutva-backend-jwh8.onrender.com/videos/${user.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.data) {
                  updatedUser = {
                    ...updatedUser,
                    videoUrl: response.data.videoUrl,
                    videoUploadedAt: response.data.uploadedAt,
                  };
                }
              } catch (error: unknown) {
                // 404 is expected for users without videos
                if (
                  axios.isAxiosError(error) &&
                  error.response?.status !== 404
                ) {
                  console.error(
                    `[Users] Error checking video for user ${user.id}:`,
                    error
                  );
                }
              }

              return updatedUser;
            } catch (error) {
              console.error(`[Users] Error processing user ${user.id}:`, error);
              return user;
            }
          })
        );

        // Update the users array with this batch's results
        batchResults.forEach((updatedUser, batchIndex) => {
          updatedUsers[i + batchIndex] = updatedUser;
        });

        // Update the state after each batch to show progress
        setUsers([...updatedUsers]);
        setFilteredUsers(() => {
          // Only update filtered users that match the current filter
          if (searchTerm.trim() === "") {
            return [...updatedUsers];
          } else {
            const lowercasedTerm = searchTerm.toLowerCase();
            return updatedUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(lowercasedTerm) ||
                user.email.toLowerCase().includes(lowercasedTerm) ||
                (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
                user.id.toLowerCase().includes(lowercasedTerm)
            );
          }
        });
      }

      // Now fetch quiz activity in the background (less important data)
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batch.map(async (user, batchIndex) => {
            try {
              // Fetch quiz activity
              const quizActivity = await fetchUserQuizActivity(user.id);
              return {
                ...updatedUsers[i + batchIndex],
                quizActivity,
              };
            } catch (error) {
              console.error(
                `[Users] Error fetching quiz activity for user ${user.id}:`,
                error
              );
              return updatedUsers[i + batchIndex];
            }
          })
        );

        // Update the users array with this batch's results
        batchResults.forEach((updatedUser, batchIndex) => {
          updatedUsers[i + batchIndex] = updatedUser;
        });

        // Update the state after each batch
        setUsers([...updatedUsers]);
        setFilteredUsers(() => {
          if (searchTerm.trim() === "") {
            return [...updatedUsers];
          } else {
            const lowercasedTerm = searchTerm.toLowerCase();
            return updatedUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(lowercasedTerm) ||
                user.email.toLowerCase().includes(lowercasedTerm) ||
                (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
                user.id.toLowerCase().includes(lowercasedTerm)
            );
          }
        });
      }

      return updatedUsers;
    } catch (error) {
      console.error("[Users] Error checking videos for users:", error);
      return users;
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      unsubscribe = await setupUsers();
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(lowercasedTerm) ||
            user.email.toLowerCase().includes(lowercasedTerm) ||
            (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
            user.id.toLowerCase().includes(lowercasedTerm)
        )
      );
    }
  }, [searchTerm]);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = (user: User) => {
    setUserToUpdate(user);
    setIsUpdateModalOpen(true);
  };

  const updateUserInList = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    toast.success("User updated successfully!");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const addUserToList = (newUser: User) => {
    setUsers((prevUsers) => [
      ...prevUsers,
      {
        ...newUser,
        phoneNumber: newUser.phoneNumber
          ? newUser.phoneNumber.toString()
          : undefined,
        quizActivity: {
          attempted: (newUser.quizActivity?.attempted as QuizAttempt[]) || [],
          registered:
            (newUser.quizActivity?.registered as Array<{
              quizId: string;
              quizTitle: string;
              status: string;
              registerDate: string;
            }>) || [],
        },
      },
    ]);
    setShowCreateUser(false);
  };

  const handleDelete = (userId: string) => {
    toast.warn(
      <div className="p-4">
        <p className="font-semibold text-orange-800 text-lg">
          Are you sure you want to delete this user?
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => confirmDelete(userId)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: "bg-white rounded-xl shadow-lg border-2 border-orange-200",
      }
    );
  };

  const confirmDelete = async (userId: string) => {
    toast.dismiss();
    setDeletingUserId(userId);

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "users", userId));
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          <p className="text-orange-700 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-800">
            User Management
          </h1>
          <p className="text-orange-600 mt-1">
            Manage and organize user information
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-orange-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border-2 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Create User</span>
            </button>

            {showCreateUser && (
              <CreateUser
                onUserCreated={addUserToList}
                onCancel={() => setShowCreateUser(false)}
              />
            )}
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={setupUsers}
                    className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-orange-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <UserCircle size={64} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-orange-800">
                No users found
              </h3>
              <p className="text-orange-600 mt-1">
                {searchTerm
                  ? "Try different search terms"
                  : "Add a new user to get started"}
              </p>
              <button
                onClick={() => setShowCreateUser(true)}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Add First User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border-2 border-orange-200">
              <table className="min-w-full divide-y divide-orange-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider"
                    >
                      User Information
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-orange-800 uppercase tracking-wider"
                    >
                      Quiz Activity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-orange-800 uppercase tracking-wider"
                    >
                      Video
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-orange-800 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-200">
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-orange-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-lg font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex flex-col space-y-1">
                            <div className="text-sm font-medium text-orange-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-orange-700 flex items-center">
                              <Mail
                                size={14}
                                className="text-orange-400 mr-1"
                              />
                              {user.email}
                            </div>
                            <div className="text-xs text-orange-700 flex items-center">
                              <Phone
                                size={14}
                                className="text-orange-400 mr-1"
                              />
                              {user.phoneNumber ?? "N/A"}
                            </div>
                            {/* <div className="text-xs text-orange-500 mt-1">
                              ID: {user.id.substring(0, 8)}...
                            </div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center space-y-2">
                          {user.quizActivity?.attempted &&
                          user.quizActivity.attempted.length > 0 ? (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {user.quizActivity.attempted.length} Completed
                              </span>
                            </div>
                          ) : null}

                          {user.quizActivity?.registered &&
                          user.quizActivity.registered.length > 0 ? (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {user.quizActivity.registered.length} Registered
                              </span>
                            </div>
                          ) : null}

                          {(!user.quizActivity?.attempted ||
                            user.quizActivity.attempted.length === 0) &&
                            (!user.quizActivity?.registered ||
                              user.quizActivity.registered.length === 0) && (
                              <span className="text-xs text-gray-500">
                                No quiz activity
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {user.videoUrl ? (
                          <div className="flex justify-center">
                            <div
                              className="bg-green-100 p-1.5 rounded-full text-green-600 cursor-pointer hover:bg-green-200 transition-colors"
                              title="View video"
                              onClick={() => {
                                handleView(user);
                                // Small delay to allow modal to open before showing video
                                setTimeout(() => setShowVideoModal(true), 300);
                              }}
                            >
                              <Video size={16} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-orange-400">
                            No video
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(user)}
                            className="bg-orange-100 hover:bg-orange-200 p-2 rounded-full text-orange-600 transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdate(user)}
                            className="bg-orange-100 hover:bg-orange-200 p-2 rounded-full text-orange-600 transition-colors"
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className={`p-2 rounded-full text-red-600 transition-colors ${
                              deletingUserId === user.id
                                ? "bg-red-100 opacity-50 cursor-not-allowed"
                                : "bg-orange-100 hover:bg-orange-200"
                            }`}
                            disabled={deletingUserId === user.id}
                            title="Delete user"
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 bg-orange-50 text-orange-700 text-sm">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full relative overflow-hidden max-h-[80vh] flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="bg-orange-600 p-6 text-white">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={closeModal}
                    className="text-white/80 hover:text-white transition-colors focus:outline-none"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                    <p className="text-orange-100">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                      <UserCircle size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-orange-500">User ID</div>
                      <div className="font-medium text-orange-900">
                        {selectedUser.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-orange-500">
                        Email Address
                      </div>
                      <div className="font-medium text-orange-900">
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-orange-500">
                        Phone Number
                      </div>
                      <div className="font-medium text-orange-900">
                        {selectedUser.phoneNumber ?? "Not provided"}
                      </div>
                    </div>
                  </div>

                  {/* Quiz Activity Section */}
                  <div className="pt-4 border-t border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-clipboard-list"
                        >
                          <rect
                            width="8"
                            height="4"
                            x="8"
                            y="2"
                            rx="1"
                            ry="1"
                          />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="M12 11h4" />
                          <path d="M12 16h4" />
                          <path d="M8 11h.01" />
                          <path d="M8 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-orange-500">
                          Quiz Activity
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedUser.quizActivity?.attempted &&
                      selectedUser.quizActivity.attempted.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium text-orange-800 mb-2">
                            Completed Quizzes
                          </h4>
                          <div className="space-y-2">
                            {selectedUser.quizActivity.attempted.map(
                              (quiz, index) => (
                                <div
                                  key={index}
                                  className="bg-green-50 p-3 rounded-lg border border-green-100"
                                >
                                  <div className="font-medium text-green-800">
                                    {quiz.quizTitle}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    Score: {quiz.result}%
                                  </div>
                                  <div className="text-xs text-green-600">
                                    Completed: {quiz.attemptDate}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : null}

                      {selectedUser.quizActivity?.registered &&
                      selectedUser.quizActivity.registered.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium text-orange-800 mb-2">
                            Registered Quizzes
                          </h4>
                          <div className="space-y-2">
                            {selectedUser.quizActivity.registered.map(
                              (quiz, index) => (
                                <div
                                  key={index}
                                  className="bg-orange-50 p-3 rounded-lg border border-orange-100"
                                >
                                  <div className="font-medium text-orange-800">
                                    {quiz.quizTitle}
                                  </div>
                                  <div className="text-xs text-orange-600 mt-1">
                                    Status: {quiz.status}
                                  </div>
                                  <div className="text-xs text-orange-600">
                                    Registered: {quiz.registerDate}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : null}

                      {(!selectedUser.quizActivity?.attempted ||
                        selectedUser.quizActivity.attempted.length === 0) &&
                        (!selectedUser.quizActivity?.registered ||
                          selectedUser.quizActivity.registered.length ===
                            0) && (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                              No quiz activity found
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="pt-4 border-t border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                        <Video size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-orange-500">
                          User Video
                        </div>
                      </div>
                    </div>

                    {selectedUser.videoUrl ? (
                      <div className="space-y-3">
                        <div className="text-sm text-orange-700">
                          <p>File: {selectedUser.videoFileName}</p>
                          <p>
                            Uploaded: {formatDate(selectedUser.videoUploadedAt)}
                          </p>
                        </div>

                        <div className="relative group rounded-lg overflow-hidden">
                          <video
                            src={selectedUser.videoUrl}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer"
                            onClick={() => setShowVideoModal(true)}
                          />
                          <div
                            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => setShowVideoModal(true)}
                          >
                            <div className="bg-orange-500 rounded-full p-3 text-white">
                              <Play size={20} />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Trigger file input click for replacing video
                              const fileInput = document.getElementById(
                                `video-upload-${selectedUser.id}`
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.click();
                              }
                            }}
                            className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={16} />
                            Replace
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(selectedUser.id)}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="border-2 border-dashed border-orange-200 rounded-lg p-4 text-center hover:border-orange-300 transition-colors">
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                selectedUser.id,
                                selectedUser.name,
                                selectedUser.email
                              )
                            }
                            className="hidden"
                            id={`video-upload-${selectedUser.id}`}
                            disabled={isUploading}
                          />
                          <label
                            htmlFor={`video-upload-${selectedUser.id}`}
                            className={`cursor-pointer flex flex-col items-center justify-center ${
                              isUploading ? "opacity-50" : ""
                            }`}
                          >
                            {isUploading ? (
                              <Loader2 className="w-10 h-10 text-orange-500 mb-3 animate-spin" />
                            ) : (
                              <Upload className="w-10 h-10 text-orange-500 mb-3" />
                            )}
                            <p className="text-orange-700 font-medium">
                              {isUploading
                                ? "Uploading..."
                                : "Click to upload video"}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              MP4 or WebM, max 100MB
                            </p>
                          </label>
                        </div>

                        {isUploading && (
                          <div className="mt-3">
                            <div className="w-full bg-orange-100 rounded-full h-2 mb-1">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-orange-600">
                              <span>{uploadProgress.percent}% uploaded</span>
                              <span>
                                {formatBytes(uploadProgress.loaded)} of{" "}
                                {formatBytes(uploadProgress.total)}
                              </span>
                            </div>
                            {uploadProgress.speed > 0 && (
                              <div className="flex justify-between text-xs text-orange-600 mt-1">
                                <span>
                                  Speed: {formatBytes(uploadProgress.speed)}/s
                                </span>
                                {uploadProgress.timeRemaining && (
                                  <span>
                                    Time remaining:{" "}
                                    {formatTimeRemaining(
                                      uploadProgress.timeRemaining
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {uploadStatus === "success" && (
                          <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <p className="text-green-700">
                              Video uploaded successfully!
                            </p>
                          </div>
                        )}

                        {uploadStatus === "error" && (
                          <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2 text-sm">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <p className="text-red-700">{errorMessage}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      closeModal();
                      handleUpdate(selectedUser);
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update User Modal */}
      <UpdateUser
        user={userToUpdate}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdate={updateUserInList}
      />

      {/* Video Player Modal */}
      <AnimatePresence>
        {showVideoModal && selectedUser?.videoUrl && (
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
                  {selectedUser.name}&apos;s Video
                </h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    if (videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
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
                  src={selectedUser.videoUrl}
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
export default UserTable;
