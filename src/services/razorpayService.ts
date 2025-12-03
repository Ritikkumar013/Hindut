// src/services/razorpayService.ts

import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = 'https://hindutva-backend-jwh8.onrender.com/payments';

// Razorpay test mode key - this should be your actual test key from Razorpay dashboard
// const RAZORPAY_KEY_ID = process.env.Razorpay_Key_ID; // Replace with your actual test key

interface RazorpayError extends Error {
  response?: {
    status?: number;
    data?: unknown;  // ✅ Changed from 'any'
  };
  config?: {
    headers?: Record<string, string>;
  };
}

export const razorpayService = {
  // Create a new payment order
  createOrder: async (quizId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get authentication token
      const token = await user.getIdToken();
      console.log('[RazorpayService] Creating order for quiz:', quizId);

      const response = await axios.post(
        `${API_URL}/create-order`,
        {
          quizId,
          userId: user.uid,
          amount: 1 // ₹1 as per requirement
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } 
    catch (error: unknown) {
  const err = error as RazorpayError;
  
  console.error('[RazorpayService] Error creating order:', {
  status: err.response?.status,
  message: err.message,
  responseData: err.response?.data,  // Now safely unknown
  headers: err.config?.headers,
});
  throw error;
}
  },

  // Verify payment
  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    quizId: string;
  }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get authentication token
      const token = await user.getIdToken();

      const response = await axios.post(
        `${API_URL}/verify-payment`,
        {
          ...paymentData,
          userId: user.uid
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('[RazorpayService] Error verifying payment:', error);
      throw error;
    }
  }
};
