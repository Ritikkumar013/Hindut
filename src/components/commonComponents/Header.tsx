"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaUser, FaOm, FaSun } from "react-icons/fa";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/aboutus", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/quiz", label: "Quiz" },
  ];

  const commonButtonStyles = `
    flex items-center gap-2 
    bg-gradient-to-r from-saffron-500 to-red-600 
    text-white 
    px-4 
    py-2 
    rounded-full 
    hover:scale-105 
    transition-all
    duration-300
    backdrop-blur-md
    bg-opacity-80
    hover:shadow-lg
  `;

  const commonLinkStyles = `
    flex items-center gap-2
    text-saffron-800 
    hover:text-saffron-600 
    transition-all
    duration-300
    bg-white/20 
    backdrop-blur-md 
    px-3 
    py-1 
    rounded-full
    hover:scale-105
    hover:shadow-lg
  `;

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50 
      bg-gradient-to-br from-[#FFD700]/30 to-[#FF6347]/50 
      backdrop-blur-sm shadow-lg
      transition-all duration-500 ease-in-out
    ">
      <div className="w-full mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Spiritual Branding */}
          <div className="flex items-center space-x-3">
            <div className="
              bg-white/20 
              backdrop-blur-md 
              rounded-full 
              p-2 
              border border-white/30
              animate-pulse
              hover:animate-spin
              transition-all
              duration-500
            ">
              <FaOm className="text-saffron-600 text-2xl" />
            </div>
            <span className="
              font-sanskrit 
              text-xl 
              text-saffron-800 
              bg-white/20 
              backdrop-blur-md 
              px-3 
              py-1 
              rounded-full
              hidden md:block
              animate-fade-in
            ">
              श्री कृष्णाय नमः
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={commonLinkStyles}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Authentication Button */}
          <div className="hidden md:block">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              <button className={commonButtonStyles}>
                <FaUser />
                {isAuthenticated ? "Dashboard" : "SignUp/SignIn"}
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="
                text-saffron-800 
                bg-white/20 
                backdrop-blur-md 
                p-2 
                rounded-full
                hover:bg-white/30
                transition-all
                duration-300
                hover:scale-105
                z-50
              "
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`
            fixed inset-0 
            bg-black/60 
            backdrop-blur-sm 
            z-40 
            transition-opacity 
            duration-300
            ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          `}
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div 
          className={`
            fixed top-0 right-0 
            w-64 h-full 
            bg-gradient-to-br from-[#FFD700]/90 to-[#FF6347]/90
            backdrop-blur-xl 
            shadow-2xl 
            z-50 
            transform 
            transition-transform 
            duration-500
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            border-l border-white/20
          `}
        >
          <div className="p-6">
            <button 
              onClick={() => setIsOpen(false)} 
              className="
                absolute top-4 right-4 
                text-saffron-800 
                bg-white/20 
                backdrop-blur-md 
                p-2 
                rounded-full
                hover:bg-white/30
                transition-all
                duration-300
                hover:scale-105
              "
            >
              <FaTimes size={24} />
            </button>

            <div className="flex justify-center mb-8">
              <FaSun className="text-saffron-600 text-4xl animate-spin-slow" />
            </div>

            <nav className="mt-8 space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`
                    ${commonLinkStyles}
                    w-full
                    justify-center
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6">
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                <button
                  className={`
                    ${commonButtonStyles}
                    w-full
                    justify-center
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  {isAuthenticated ? "Dashboard" : "SignUp/SignIn"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
