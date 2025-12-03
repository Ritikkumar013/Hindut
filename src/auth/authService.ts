import { auth } from '../config/firebase';  
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";  
import { getFirestore, doc, setDoc } from "firebase/firestore";  
import { toast } from 'react-toastify';

const db = getFirestore();  // Initialize Firestore
const role = 'user';  // initialize user type by default i.e 'user'

// Function to sign up with email and password
const signUpWithEmail = async (name: string, email: string, password: string, phoneNumber: number) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: user.email,
      phoneNumber: phoneNumber,  // Store phoneNumber as a number
      role: role,
      createdAt: new Date(),
    });

    toast.success("Signup successful!");
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error('Signup failed.');
      throw new Error('Signup failed.');
    }
  }
};

// Function to log in with email and password
const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get token for authentication
    const token = await user.getIdToken();
    
    console.log("Token:", token); // Log token to check in Postman
    
    return { user, token };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Login failed.');
    }
  }
};

export { signUpWithEmail, loginWithEmail };
