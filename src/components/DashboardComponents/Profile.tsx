import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase'; // Import Firebase auth and db
import { doc, onSnapshot } from "firebase/firestore";
import { CardContent, Typography, Grid, Avatar, Paper, Container } from '@mui/material'; // MUI components
import { User as UserIcon, Phone, Mail, Calendar } from 'lucide-react'; // Lucide Icons

// Define TypeScript types for the user data
interface User {
  id: string;
  phoneNumber: number;
  role: string;
  createdAt: { toDate(): Date };
  name: string;
  email: string;
  updatedAt: { toDate(): Date };
}

function Profile() {
  // State to hold user data
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    // Real-time listener
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            id: user.uid,
            phoneNumber: data.phoneNumber || 0,
            role: data.role || "user",
            createdAt: data.createdAt || { toDate: () => new Date() },
            name: data.name || "No Name",
            email: user.email || "",
            updatedAt: data.updatedAt || { toDate: () => new Date() },
          });
        } else {
          setError("User data not found");
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-orange-700 text-lg font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
          <p className="text-orange-700">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: 'url("/Group31.png")' }}
      />
      
      {/* Semi-transparent overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-orange-100/80" />

      <Container maxWidth="md" className="relative">
        <Paper
          elevation={8}
          className="rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20"
        >
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-orange-100 to-orange-200 p-8 text-center">
            {/* Background image piercing through */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10"
              // style={{ backgroundImage: 'url("/group31.png")' }}
            />
            
            <div className="relative">
              <Avatar
                className="w-32 h-32 mx-auto border-4 border-white shadow-lg bg-white"
              >
                <UserIcon size={80} className="text-orange-400" />
              </Avatar>

              <h1 className="mt-4 text-3xl font-bold text-orange-800">
                {userData.name}
              </h1>

              <div className="mt-2 flex items-center justify-center gap-2 text-orange-700">
                <Mail size={18} />
                <span>{userData.email}</span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <CardContent className="p-8">
            <Grid container spacing={4}>
              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  className="p-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-orange-100 h-full min-h-[200px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Phone size={24} className="text-orange-400" />
                    <Typography variant="h6" className="text-orange-700">
                      Contact Information
                    </Typography>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-orange-400" />
                      <Typography className="text-orange-800">
                        <span className="font-medium">Phone:</span> {userData.phoneNumber || 'N/A'}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon size={18} className="text-orange-400" />
                      <Typography className="text-orange-800">
                        <span className="font-medium">Role:</span> {userData.role}
                      </Typography>
                    </div>
                  </div>
                </Paper>
              </Grid>

              {/* Account Details */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  className="p-6 rounded-2xl bg-white/90 backdrop-blur-sm border border-orange-100 h-full min-h-[200px]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={24} className="text-orange-400" />
                    <Typography variant="h6" className="text-orange-700">
                      Account Details
                    </Typography>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-orange-400" />
                      <Typography className="text-orange-800">
                        <span className="font-medium">Created:</span>
                        <br />
                        {userData.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-orange-400" />
                      <Typography className="text-orange-800">
                        <span className="font-medium">Last Updated:</span>
                        <br />
                        {userData.updatedAt?.toDate?.()?.toLocaleString() || "N/A"}
                      </Typography>
                    </div>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
      </Container>
    </div>
  );
}

export default Profile;