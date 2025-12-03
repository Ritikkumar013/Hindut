// Page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import Sidebar from "@/components/DashboardComponents/Sidebar";
import Profile from "@/components/DashboardComponents/Profile";
import Transactions from "@/components/DashboardComponents/Transactions";
import DashboardLayout from "@/components/DashboardComponents/DashboardLayout";
import Users from "@/components/DashboardComponents/Users";
import Questions from "@/components/DashboardComponents/Questions";
// import DashboardHeader from "@/components/DashboardComponents/DashboardHeader";
// import CreateQuiz from "@/components/DashboardComponents/CreateQuiz";
import QuizList from "@/components/DashboardComponents/QuizList";
import OptedQuizzes from "@/components/DashboardComponents/OptedQuizzes";
import VideoUpload from '@/components/DashboardComponents/VideoUpload';
import AdminQuizVideoUpload from '@/components/DashboardComponents/AdminQuizVideoUpload';
// UserVideos component removed

const Page = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch user role from Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserLoading(false);
        return;
      }

      try {
        console.log('[Dashboard] Fetching user role for:', user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isUserAdmin = userData.role === 'admin';
          console.log('[Dashboard] User role:', userData.role, 'Is admin:', isUserAdmin);
          setIsAdmin(isUserAdmin);
        } else {
          console.log('[Dashboard] User document does not exist in Firestore');
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching user role:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup'); // Redirect to signup if not logged in
    }
  }, [loading, user, router]);

  const getAuthorizedTabs = () => {
    if (isAdmin) {
      console.log('[Dashboard] Admin tabs enabled');
      return ['profile', 'transactions', 'quizlist', 'users', 'questions', 'adminquizvideos'];
    }
    console.log('[Dashboard] Regular user tabs enabled');
    return ['profile', 'optedquizzes', 'videoupload'];
  };

  const renderTabContent = () => {
    if (!user) return null;

    // Check if user has access to the current tab
    if (!getAuthorizedTabs().includes(activeTab)) {
      setActiveTab('profile'); // Reset to profile if unauthorized
      return null;
    }

    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "transactions":
        return <Transactions />;
      case "quizlist":
        return <QuizList />;
      case "users":
        return <Users />;
      case "questions":
        return <Questions />;
      case "optedquizzes":
        return <OptedQuizzes />;
      case "videoupload":
        return (
          <VideoUpload
            userData={{
              name: user.displayName || '',
              email: user.email || '',
              phone: user.phoneNumber || '',
            }}
          />
        );
      case "adminquizvideos":
        return <AdminQuizVideoUpload />;
      // UserVideos tab removed
      default:
        return <div>Dashboard Content</div>;
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
          <p className="text-orange-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="max-w-64 bg-gray-100 h-full">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            authorizedTabs={getAuthorizedTabs()}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Page;
