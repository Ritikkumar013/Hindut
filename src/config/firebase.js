// // Import the functions you need from the SDKs
// import { initializeApp } from "firebase/app";
// // import { getAuth } from "firebase/auth";  
// import { getAuth, signOut } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Import Firestore
// // import { getAnalytics } from "firebase/analytics";
// // import {
// //   firebase_api_key,
// //   authDomain, projectId, storageBucket, messagingSenderId, app_ID, measurementId}
// // from '../../.env.local';

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.firebase_api_key,
//   authDomain: process.env.authDomain,
//   projectId: process.env.projectId,
//   storageBucket: process.env.storageBucket,
//   messagingSenderId:  process.env.messagingSenderId,
//   appId: process.env.app_ID,
//   measurementId: process.env.measurementId
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase services
// const auth = getAuth(app);  // Firebase Auth instance
// const db = getFirestore(app); // Firestore database instance



// // Export auth and db for use in other parts of your application
// export { auth, db, signOut };


import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signOut };