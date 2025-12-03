'use client';
import React, { useState } from 'react';
import SignupForm from "../../components/SignupForm";
import LoginForm from '../../components/LoginForm';

export default function AuthPage() {
  const [isLoginForm, setIsLoginForm] = useState(false);

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Fixed Image */}
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 h-screen bg-saffron-100">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/bannerOm.png')" }}>
          <div className="absolute inset-0 bg-orange-900/30"></div>
        </div>
        {/* <div className="relative z-10 w-full flex items-center justify-center">
          <h1 className="text-6xl text-white font-sanskrit">॥ ॐ नमः शिवाय ॥</h1>
        </div> */}
      </div>

      {/* Right Side - Dynamic Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%]">
        {isLoginForm ? (
          <LoginForm onFormSwitch={toggleForm} />
        ) : (
          <SignupForm onFormSwitch={toggleForm} />
        )}
      </div>
    </div>
  );
}