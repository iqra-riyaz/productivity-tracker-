'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskTracker from '@/components/TaskTracker';
import Analytics from '@/components/Analytics';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'tasks' | 'analytics'>('pomodoro');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundAnimation />
      
      <motion.div
        className="container mx-auto px-4 py-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={toggleTheme}
            className="glass p-2 rounded-full hover:scale-110 transition-transform"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
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
        
        {/* Header with back button */}
        <motion.div 
          className="mb-8 flex items-center"
          variants={itemVariants}
        >
          <Link 
            href="/" 
            className="mr-4 p-2 rounded-full bg-white/20 dark:bg-gray-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Productivity Dashboard</h1>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center space-x-4 mb-8"
          variants={itemVariants}
        >
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'pomodoro'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'tasks'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-full transition-all duration-300 ${
              activeTab === 'analytics'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20'
            }`}
          >
            Analytics
          </button>
        </motion.div>

        {/* Content area with animation */}
        <motion.div
          className="glass dark:glass-dark rounded-2xl p-6 shadow-xl"
          variants={itemVariants}
        >
          {activeTab === 'pomodoro' && <PomodoroTimer />}
          {activeTab === 'tasks' && <TaskTracker />}
          {activeTab === 'analytics' && <Analytics />}
        </motion.div>
        
        {/* Footer */}
        <motion.footer
          className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <span className="gradient-text font-medium whitespace-nowrap hover:scale-105 inline-block transform transition-transform">
              Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by Iqra Riyaz
            </span>
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
} 