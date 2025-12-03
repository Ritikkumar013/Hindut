// src/components/RazorpayPayment.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { razorpayService } from '@/services/razorpayService';
import { toast } from 'react-toastify';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';

interface RazorpayPaymentProps {
  quizId: string;
  quizTitle: string;
  isRegistered?: boolean;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
}

declare global {
  interface Window {
    Razorpay: {
      new(options: unknown): {
        open(): void;
      };
    };
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  quizId,
  quizTitle,
  isRegistered = false,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const { user } = useAuth() as { user: User | null };
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>(
    isRegistered ? 'success' : 'pending'
  );
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Log Razorpay key for debugging
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error('[RazorpayPayment] ERROR: Razorpay key not found in environment variables!');
      console.error('[RazorpayPayment] Make sure NEXT_PUBLIC_RAZORPAY_KEY_ID is set in .env.local file');
      toast.error('Razorpay configuration is missing. Please contact support.');
    } else {
      console.log('[RazorpayPayment] Environment:', {
        RAZORPAY_KEY_ID: 'Set',
        KEY_PREFIX: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.substring(0, 8) + '...'
      });
    }
  }, []);

  // Handle payment initiation
  // const handlePayment = async () => {
  //   if (!user) {
  //     toast.error('Please log in to make a payment');
  //     return;
  //   }

  //   if (isRegistered || paymentStatus === 'success') {
  //     handlePlayClick();
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);

  //     const orderResponse = await razorpayService.createOrder(quizId);

  //     if (!orderResponse.success || !orderResponse.order) {
  //       throw new Error('Failed to create payment order');
  //     }

  //     const order = orderResponse.order;

  //     const options = {
  //       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  //       amount: order.amount,
  //       currency: order.currency,
  //       name: 'Hindutva Quiz',
  //       description: `Registration for ${quizTitle}`,
  //       order_id: order.id,
  //       prefill: {
  //         name: user.displayName ?? '',
  //         email: user.email ?? '',
  //         contact: user.phoneNumber ?? ''
  //       },
  //       notes: {
  //         quizId: quizId,
  //         userId: user.uid
  //       },
  //       theme: {
  //         color: '#FF6B1A'
  //       },
  //       handler: async function (response: {
  //         razorpay_order_id: string;
  //         razorpay_payment_id: string;
  //         razorpay_signature: string;
  //       }) {
  //         try {
  //           const verificationResponse = await razorpayService.verifyPayment({
  //             razorpay_order_id: response.razorpay_order_id,
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_signature: response.razorpay_signature,
  //             quizId: quizId
  //           });

  //           if (verificationResponse.success) {
  //             setPaymentStatus('success');
  //             onPaymentSuccess();
  //             toast.success('Registration successful! You can now play the quiz.');
  //           } else {
  //             setPaymentStatus('failed');
  //             toast.error('Payment failed. Please try again.');
  //             onPaymentFailure();
  //           }
  //         } catch (error) {
  //           console.error('Payment verification error:', error);
  //           setPaymentStatus('failed');
  //           toast.error('Payment failed. Please try again.');
  //           onPaymentFailure();
  //         } finally {
  //           setIsLoading(false);
  //         }
  //       },
  //       modal: {
  //         ondismiss: function () {
  //           setIsLoading(false);
  //           toast.info('Payment was cancelled.');
  //           onPaymentFailure();
  //         }
  //       }
  //     };

  //     // ✅ Fixed: Type assertion for Razorpay instance
  //     const razorpay = new (window.Razorpay as any)(options) as { open: () => void };
  //     razorpay.open();
  //   } catch (error) {
  //     console.error('Payment error:', error);
  //     toast.error('Payment failed. Please try again.');
  //     setPaymentStatus('failed');
  //     onPaymentFailure();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

const handlePayment = async () => {
  if (!user) {
    toast.error('Please log in to make a payment');
    return;
  }

  if (isRegistered || paymentStatus === 'success') {
    handlePlayClick();
    return;
  }

  try {
    setIsLoading(true);

    const orderResponse = await razorpayService.createOrder(quizId);

    if (!orderResponse.success || !orderResponse.order) {
      throw new Error('Failed to create payment order');
    }

    const order = orderResponse.order;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      amount: order.amount,
      currency: order.currency,
      name: 'Hindutva Quiz',
      description: `Registration for ${quizTitle}`,
      order_id: order.id,
      prefill: {
        name: user.displayName ?? '',
        email: user.email ?? '',
        contact: user.phoneNumber ?? ''
      },
      notes: {
        quizId: quizId,
        userId: user.uid
      },
      theme: {
        color: '#FF6B1A'
      },
      handler: async function (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) {
        try {
          const verificationResponse = await razorpayService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            quizId: quizId
          });

          if (verificationResponse.success) {
            setPaymentStatus('success');
            onPaymentSuccess();
            toast.success('Registration successful! You can now play the quiz.');
          } else {
            setPaymentStatus('failed');
            toast.error('Payment failed. Please try again.');
            onPaymentFailure();
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentStatus('failed');
          toast.error('Payment failed. Please try again.');
          onPaymentFailure();
        } finally {
          setIsLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
          toast.info('Payment was cancelled.');
          onPaymentFailure();
        }
      }
    };

    // ✅ FIXED: No more 'any' type assertion
    // const razorpay = (window.Razorpay as unknown as { new(options: unknown): { open(): void } })(options);
    const razorpay = new (window.Razorpay as unknown as new (options: unknown) => { open(): void })(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
    setPaymentStatus('failed');
    onPaymentFailure();
  } finally {
    setIsLoading(false);
  }
};


  const handlePlayClick = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />

      {(isRegistered || paymentStatus === 'success') ? (
        <button
          onClick={handlePlayClick}
          className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-green-500 text-white hover:bg-green-600"
        >
          {isRegistered ? 'Play Quiz' : 'Play'}
        </button>
      ) : (
        <button
          onClick={handlePayment}
          disabled={isLoading || !scriptLoaded}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-orange-300 text-white cursor-wait'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isLoading ? 'Processing...' : `Pay ₹1 to Register`}
        </button>
      )}
    </>
  );
};

export default RazorpayPayment;
