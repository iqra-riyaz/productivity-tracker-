'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage on client side
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldUseDarkMode);
    
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Individual item variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleTheme}
          className="glass p-2 rounded-full hover:scale-110 transition-transform"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-indigo-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <motion.div 
        className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Logo/Icon */}
        <motion.div
          className="mb-8 relative"
          variants={itemVariants}
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <div className="absolute inset-0 bg-lavender rounded-full opacity-20 animate-pulse-slow"></div>
            <div className="absolute inset-[15%] bg-light-pink rounded-full opacity-30 animate-float"></div>
            <div className="absolute inset-[30%] bg-sky-blue rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-center mb-4 gradient-text"
          variants={itemVariants}
        >
          Productivity Tracker
        </motion.h1>

        {/* Subheading */}
        <motion.p 
          className="text-xl md:text-2xl text-center mb-10 max-w-2xl text-gray-700 dark:text-gray-300"
          variants={itemVariants}
        >
          Stay focused, track your time, and boost efficiency effortlessly!
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/dashboard" 
            className="px-8 py-4 text-lg font-medium text-white bg-lavender rounded-lg shadow-lg glow-button transition-all duration-300 inline-block relative overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-lavender via-sky-blue to-light-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          className="mt-20 w-full max-w-4xl mx-auto glass rounded-xl p-6 shadow-xl overflow-hidden"
          variants={itemVariants}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-inner bg-gradient-to-br from-lavender/20 via-sky-blue/20 to-light-pink/20 flex flex-col items-center justify-center p-8">
            <div className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Dashboard Preview</div>
            
            {/* Mockup UI Elements */}
            <div className="w-full flex flex-col md:flex-row gap-6">
              {/* Timer Section */}
              <div className="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg flex-1 shadow">
                <div className="w-20 h-20 rounded-full bg-lavender/40 mx-auto mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xl font-bold">
                    25:00
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-300">Pomodoro Timer</div>
              </div>
              
              {/* Tasks Section */}
              <div className="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg flex-1 shadow">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks</div>
                  <div className="bg-lavender/20 rounded p-1 flex items-center">
                    <div className="w-3 h-3 rounded-full border border-lavender mr-2"></div>
                    <div className="text-xs">Complete project</div>
                  </div>
                  <div className="bg-lavender/20 rounded p-1 flex items-center">
                    <div className="w-3 h-3 rounded-full border border-lavender mr-2 bg-lavender"></div>
                    <div className="text-xs line-through opacity-60">Send email</div>
                  </div>
                </div>
              </div>
              
              {/* Analytics Section */}
              <div className="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg flex-1 shadow">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Analytics</div>
                <div className="h-12 bg-lavender/20 rounded flex items-end p-1">
                  <div className="w-1/5 h-4 bg-lavender rounded-sm"></div>
                  <div className="w-1/5 h-6 bg-lavender rounded-sm mx-1"></div>
                  <div className="w-1/5 h-8 bg-lavender rounded-sm"></div>
                  <div className="w-1/5 h-5 bg-lavender rounded-sm mx-1"></div>
                  <div className="w-1/5 h-7 bg-lavender rounded-sm"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>
              </div>
            </div>
            
            <Link 
              href="/dashboard"
              className="mt-6 px-4 py-2 bg-lavender/90 text-white rounded-md text-sm font-medium transition-all hover:bg-lavender"
            >
              View Dashboard
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section - Optional if needed */}

      {/* Footer */}
      <motion.footer 
        className="py-8 text-center text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-sm md:text-base">Made with ❤️ by Iqra Riyaz</p>
      </motion.footer>
    </div>
  );
} 