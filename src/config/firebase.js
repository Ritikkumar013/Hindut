// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";  
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// import { getAnalytics } from "firebase/analytics";



// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxx6o10LUuNRABDgCurGQw9qVkCJywq-k",
  authDomain: "hindutva-5b837.firebaseapp.com",
  projectId: "hindutva-5b837",
  storageBucket: "hindutva-5b837.firebasestorage.app",
  messagingSenderId: "386458548506",
  appId: "1:386458548506:web:a0634ddbca8c17470b14a3",
  measurementId: "G-4F4MQ3QF4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);  // Firebase Auth instance
const db = getFirestore(app); // Firestore database instance



// Export auth and db for use in other parts of your application
export { auth, db, signOut };
