import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { signOut, User as FirebaseUser } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { User, CreditCard, Book, Users, HelpCircle, LogOut, Menu, X, ClipboardList, Video, Film } from "lucide-react"; // Added ClipboardList, Video, and Film icons
import { Tooltip } from '@mui/material'; // Import Tooltip from MUI
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { toast } from 'react-toastify';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  authorizedTabs: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, authorizedTabs }) => {
  const router = useRouter(); // Initialize router
  const [isMinimal, setIsMinimal] = useState(false); // State to toggle between minimal and expanded sidebar
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [hasOptedQuizzes, setHasOptedQuizzes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOptedQuizzes = async () => {
      if (!auth.currentUser) {
        console.log('[Sidebar] No authenticated user found');
        setIsLoading(false);
        setHasOptedQuizzes(false);
        return;
      }

      try {
        console.log('[Sidebar] Checking opted quizzes for user:', auth.currentUser.uid);
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(`https://hindutva-backend-jwh8.onrender.com/optedQuiz/user/${auth.currentUser.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[Sidebar] Opted quizzes response:', response.data);
        setHasOptedQuizzes(response.data.length > 0);
      } 
      // catch (error: any) {
      //   console.error('[Sidebar] Error checking opted quizzes:', {
      //     message: error.message,
      //     status: error.response?.status,
      //     data: error.response?.data
      //   });
      //   // Don't set hasOptedQuizzes to false on error, maintain previous state
      //   toast.error('Failed to check quiz attempts. Please try refreshing the page.');
      // }
      catch (error: unknown) {
  if (error instanceof Error) {
    // If error is an Error instance, access its message
    console.error('[Sidebar] Error checking opted quizzes:', {
      message: error.message,
      status: (error as { response?: { status?: number } }).response?.status,
      data: (error as { response?: { data?: unknown } }).response?.data
    });
    toast.error('Failed to check quiz attempts. Please try refreshing the page.');
  } else {
    // Fallback unknown error case
    console.error('[Sidebar] Unknown error checking opted quizzes:', error);
    toast.error('Failed to check quiz attempts. Please try refreshing the page.');
  }
}
       finally {
        setIsLoading(false);
      }
    };

    checkOptedQuizzes();
  }, []);

  const baseTabs = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={20} /> },
    { id: 'quizlist', label: 'Quiz List', icon: <Book size={20} /> },
    { id: 'optedquizzes', label: 'My Quiz Attempts', icon: <ClipboardList size={20} /> },
  ];

  const adminTabs = [
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'questions', label: 'Questions', icon: <HelpCircle size={20} /> },
    { id: 'adminquizvideos', label: 'Quiz Videos', icon: <Film size={20} /> },
  ];

  const videoTab = { id: 'videoupload', label: 'Upload Video', icon: <Video size={20} /> };

  const visibleTabs = [
    ...baseTabs,
    ...(hasOptedQuizzes ? [videoTab] : []),
    ...adminTabs
  ].filter(tab => authorizedTabs.includes(tab.id));

  // Log the current state for debugging
  useEffect(() => {
    console.log('[Sidebar] Current state:', {
      hasOptedQuizzes,
      authorizedTabs,
      isLoading,
      visibleTabIds: visibleTabs.map(t => t.id)
    });
  }, [hasOptedQuizzes, authorizedTabs, isLoading, visibleTabs]);

  // Handle Logout logic
  const handleLogout = async () => {
    try {
      // Sign the user out from Firebase
      await signOut(auth);

      // Redirect to the login page
      router.push('/');
    } catch (error) {
      console.error("Logout Error: ", error);
      // Even if there's an error, try to redirect to login
      router.push('/');
    }
  };

  return (
    <motion.div
      className={`relative h-screen bg-white border-r border-orange-100 transition-all duration-300 ${isMinimal ? "w-20" : "w-60"}`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Toggle button for minimal/expanded view */}
      <motion.button
        onClick={() => setIsMinimal(!isMinimal)}
        className="absolute top-6 right-6 p-2.5 cursor-pointer bg-orange-100 rounded-full hover:bg-orange-200 transition-colors z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative w-6 h-6">
          <AnimatePresence mode="wait">
            {isMinimal ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Menu size={24} className="text-orange-600" />
              </motion.div>
            ) : (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <X size={24} className="text-orange-600" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Main content container */}
      <div className="flex flex-col h-full pt-20 pb-6">
        {/* Navigation items */}
        <div className="flex-1 px-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            visibleTabs.map((tab, index) => (
              <Tooltip key={tab.id} title={isMinimal ? tab.label : ""} placement="right">
                <motion.button
                  onClick={() => onTabChange(tab.id)}
                  onHoverStart={() => setIsHovered(tab.id)}
                  onHoverEnd={() => setIsHovered(null)}
                  className={`w-full text-left p-3 rounded-xl mb-2 flex items-center space-x-3 relative overflow-hidden ${
                    activeTab === tab.id
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-orange-100 text-orange-700'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated background for active state */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-orange-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                  )}

                  {/* Hover effect */}
                  {isHovered === tab.id && activeTab !== tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-orange-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex items-center">
                    {tab.icon}
                    <AnimatePresence>
                      {!isMinimal && (
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="ml-3"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </Tooltip>
            ))
          )}
        </div>

        {/* Logout Button */}
        <motion.div
          className="px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-xl flex items-center space-x-3 bg-red-500 hover:bg-red-600 text-white transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!isMinimal && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
