// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";  
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// import { getAnalytics } from "firebase/analytics";



// Firebase configuration
const firebaseConfig = {
  apiKey: firebase_api_key,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId:  messagingSenderId,
  appId: app_ID,
  measurementId: measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);  // Firebase Auth instance
const db = getFirestore(app); // Firestore database instance



// Export auth and db for use in other parts of your application
export { auth, db, signOut };
