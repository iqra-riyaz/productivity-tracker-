'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import useSound from 'use-sound';
import { trackPomodoro } from '@/lib/analyticsService';
import { useApp } from '@/context/AppContext';

// Types
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

// Define timer settings interface
interface TimerSettings {
  pomodoro: number | string;
  shortBreak: number | string;
  longBreak: number | string;
}

const PomodoroTimer = () => {
  const { 
    completedPomodoros, 
    setCompletedPomodoros,
    timerSettings,
    setTimerSettings
  } = useApp();
  
  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('secondsLeft');
      return saved ? parseInt(saved) : timerSettings.pomodoro * 60;
    }
    return timerSettings.pomodoro * 60;
  });
  
  const [isActive, setIsActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timerIsActive');
      return saved === 'true';
    }
    return false;
  });
  
  const [mode, setMode] = useState<TimerMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timerMode') as TimerMode | null;
      return saved || 'pomodoro';
    }
    return 'pomodoro';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    pomodoro: timerSettings.pomodoro.toString(),
    shortBreak: timerSettings.shortBreak.toString(),
    longBreak: timerSettings.longBreak.toString()
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundEnabled');
      return saved === null ? true : saved === 'true';
    }
    return true;
  });
  
  // Sound effects
  const [playStart] = useSound('/sounds/start.mp3', { volume: 0.5 });
  const [playPause] = useSound('/sounds/pause.mp3', { volume: 0.5 });
  const [playComplete] = useSound('/sounds/complete.mp3', { volume: 0.5 });
  
  // Refs for intervals and precise timing
  const secondsLeftRef = useRef(secondsLeft);
  const isActiveRef = useRef(isActive);
  const modeRef = useRef(mode);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number | null>(null);
  
  // Persist timer state to localStorage
  useEffect(() => {
    localStorage.setItem('secondsLeft', secondsLeft.toString());
    localStorage.setItem('timerIsActive', isActive.toString());
    localStorage.setItem('timerMode', mode);
    localStorage.setItem('soundEnabled', soundEnabled.toString());
  }, [secondsLeft, isActive, mode, soundEnabled]);
  
  // Update refs when state changes
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
    isActiveRef.current = isActive;
    modeRef.current = mode;
    
    // Update target time when secondsLeft changes
    if (isActive && secondsLeft > 0) {
      const now = Date.now();
      startTimeRef.current = now;
      targetTimeRef.current = now + secondsLeft * 1000;
    }
  }, [secondsLeft, isActive, mode]);
  
  // Calculate total seconds based on mode and settings
  const calculateTotalSeconds = (currentMode: TimerMode, settings: any): number => {
    return settings[currentMode] * 60;
  };
  
  // Format time display (mm:ss)
  const formatTime = (): string => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Switch timer mode
  const switchMode = (newMode: TimerMode) => {
    // Stop existing timer if running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setMode(newMode);
    const newTotalSeconds = calculateTotalSeconds(newMode, timerSettings);
    setSecondsLeft(newTotalSeconds);
    secondsLeftRef.current = newTotalSeconds;
    modeRef.current = newMode;
    
    // Reset target time
    startTimeRef.current = null;
    targetTimeRef.current = null;
  };
  
  // Toggle timer start/pause
  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    isActiveRef.current = nextState;
    
    if (nextState) {
      // Start timer: set start and target times
      const now = Date.now();
      startTimeRef.current = now;
      targetTimeRef.current = now + secondsLeft * 1000;
      
      // Start a new timer only if not already running
      if (!intervalRef.current) {
        startTimer();
      }
      
      if (soundEnabled) {
        try { playStart(); } catch (e) {}
      }
    } else {
      // Pause timer: clear interval and reset start time
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
      
      if (soundEnabled) {
        try { playPause(); } catch (e) {}
      }
    }
  };
  
  // Start precise timer
  const startTimer = () => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (!isActiveRef.current || !targetTimeRef.current) {
        return;
      }
      
      const now = Date.now();
      const remaining = Math.ceil((targetTimeRef.current - now) / 1000);
      
      if (remaining <= 0) {
        // Timer completed
        completeTimer();
      } else if (remaining !== secondsLeftRef.current) {
        // Update seconds left only when it actually changes
        secondsLeftRef.current = remaining;
        setSecondsLeft(remaining);
      }
    }, 100); // Check more frequently for accuracy
  };
  
  // Handle timer completion
  const completeTimer = () => {
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Play completion sound
    if (soundEnabled) {
      try { playComplete(); } catch (e) {}
    }
    
    // Update state
    isActiveRef.current = false;
    setIsActive(false);
    setSecondsLeft(0);
    secondsLeftRef.current = 0;
    
    // Show motivation message
    setShowMotivation(true);
    
    // Track completed pomodoro in analytics
    if (modeRef.current === 'pomodoro') {
      const completedMinutes = timerSettings.pomodoro;
      console.log('Tracking pomodoro completion:', completedMinutes);
      trackPomodoro(completedMinutes);
      
      // Update completedPomodoros counter
      const newValue = completedPomodoros + 1;
      setCompletedPomodoros(newValue);
      // Explicitly update localStorage as a backup
      localStorage.setItem('completedPomodoros', newValue.toString());
    }
    
    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('Timer Complete!', {
          body: modeRef.current === 'pomodoro' 
            ? 'Great job! Take a break.'
            : 'Break is over. Back to work!',
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.log('Notification error:', e);
      }
    }
  };
  
  // Set up timer interval and notification permissions
  useEffect(() => {
    // Request notification permission
    if (typeof Notification !== 'undefined' && 
        Notification.permission !== 'granted' && 
        Notification.permission !== 'denied') {
      try {
        Notification.requestPermission();
      } catch (e) {
        console.log('Notification permission request failed:', e);
      }
    }
    
    // Initial timer setup
    if (isActiveRef.current && secondsLeftRef.current > 0) {
      const now = Date.now();
      startTimeRef.current = now;
      targetTimeRef.current = now + secondsLeftRef.current * 1000;
      startTimer();
    }
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  
  // Handle numeric input change for settings
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof typeof tempSettings) => {
    const value = e.target.value;
    
    // Use temporary state for text inputs
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply settings when saved
  const saveSettings = () => {
    const validatedSettings = {
      pomodoro: Math.max(1, Math.min(120, parseInt(tempSettings.pomodoro) || 25)),
      shortBreak: Math.max(1, Math.min(120, parseInt(tempSettings.shortBreak) || 5)),
      longBreak: Math.max(1, Math.min(120, parseInt(tempSettings.longBreak) || 15))
    };
    
    setTimerSettings(validatedSettings);
    
    // Reset current timer if needed
    if (isActive) {
      // Don't reset if timer is active
      // But update secondsLeft to match new settings if user manually does this
      if (confirm('Timer is currently active. Do you want to restart with new settings?')) {
        resetTimer(validatedSettings);
      }
    } else {
      // Reset timer with new settings if inactive
      resetTimer(validatedSettings);
    }
    
    setShowSettings(false);
  };
  
  // Open settings modal
  const openSettings = () => {
    // Initialize temp settings with current values
    setTempSettings({
      pomodoro: timerSettings.pomodoro.toString(),
      shortBreak: timerSettings.shortBreak.toString(),
      longBreak: timerSettings.longBreak.toString()
    });
    setShowSettings(true);
  };
  
  // Calculate progress percentage
  const progress = 100 - (secondsLeft / (timerSettings[mode] * 60) * 100);
  
  // Get appropriate color based on the current mode
  const getTimerColor = () => {
    switch (mode) {
      case 'pomodoro':
        return '#9370DB'; // Lavender
      case 'shortBreak':
        return '#87CEEB'; // Sky blue
      case 'longBreak':
        return '#F8C8DC'; // Soft pink - exact match with button
      default:
        return '#9370DB';
    }
  };

  // Reset timer function
  const resetTimer = (settings = timerSettings) => {
    // Clear interval if running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset timer state
    const totalSeconds = calculateTotalSeconds(mode, settings);
    setSecondsLeft(totalSeconds);
    secondsLeftRef.current = totalSeconds;
    
    // Reset start and target times
    startTimeRef.current = null;
    targetTimeRef.current = null;
    
    // If timer was active, start a fresh timer
    if (isActiveRef.current) {
      const now = Date.now();
      startTimeRef.current = now;
      targetTimeRef.current = now + totalSeconds * 1000;
      startTimer();
    }
  };

  // Toggle sound 
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-100">
          Focus Timer
        </h2>
        
        {/* Timer mode buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              mode === 'pomodoro' 
                ? 'bg-lavender text-white shadow-md' 
                : 'bg-white/30 hover:bg-white/50 text-gray-600 dark:text-gray-300 dark:bg-white/10 dark:hover:bg-white/20'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              mode === 'shortBreak' 
                ? 'bg-sky-blue text-white shadow-md' 
                : 'bg-white/30 hover:bg-white/50 text-gray-600 dark:text-gray-300 dark:bg-white/10 dark:hover:bg-white/20'
            }`}
          >
            Short Break
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              mode === 'longBreak' 
                ? 'bg-light-pink text-white shadow-md' 
                : 'bg-white/30 hover:bg-white/50 text-gray-600 dark:text-gray-300 dark:bg-white/10 dark:hover:bg-white/20'
            }`}
          >
            Long Break
          </button>
        </div>
        
        {/* Timer display */}
        <div className="flex justify-center mb-6">
          <div className="w-60 h-60">
            <CircularProgressbar
              value={progress}
              text={formatTime()}
              styles={buildStyles({
                textSize: '20px',
                textColor: `var(--color-text-primary, ${getTimerColor()})`,
                pathColor: getTimerColor(),
                trailColor: 'rgba(238, 238, 238, 0.3)',
                pathTransition: 'stroke-dashoffset 0.5s ease',
              })}
              className={`${isActive ? 'glow-timer' : ''}`}
            />
          </div>
        </div>
        
        {/* Timer controls */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={toggleTimer}
            className="px-6 py-2 bg-lavender text-white rounded-md shadow-md hover:bg-opacity-90 transition-all duration-300"
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => resetTimer()}
            className="px-6 py-2 bg-white/30 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-md hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300"
          >
            Reset
          </button>
        </div>
        
        {/* Settings and sound controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={openSettings}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-lavender dark:hover:text-lavender transition-colors"
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Settings
            </span>
          </button>
          
          <button
            onClick={toggleSound}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-lavender dark:hover:text-lavender transition-colors"
          >
            <span className="flex items-center gap-1">
              {soundEnabled ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
              )}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Settings modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Timer Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pomodoro Length (minutes)
                  </label>
                  <input
                    type="number"
                    value={tempSettings.pomodoro}
                    onChange={(e) => handleInputChange(e, 'pomodoro')}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-lavender dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Short Break Length (minutes)
                  </label>
                  <input
                    type="number"
                    value={tempSettings.shortBreak}
                    onChange={(e) => handleInputChange(e, 'shortBreak')}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-lavender dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Long Break Length (minutes)
                  </label>
                  <input
                    type="number"
                    value={tempSettings.longBreak}
                    onChange={(e) => handleInputChange(e, 'longBreak')}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-lavender dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-4 py-2 bg-lavender text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Motivation message */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {mode === 'pomodoro' ? 'Great job!' : 'Break time is over!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {mode === 'pomodoro' 
                  ? 'You\'ve completed a focused work session. Take a break!'
                  : 'Time to get back to work and stay focused!'}
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowMotivation(false);
                    if (mode === 'pomodoro') {
                      switchMode('shortBreak');
                    } else {
                      switchMode('pomodoro');
                    }
                  }}
                  className="px-6 py-2 bg-lavender text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  {mode === 'pomodoro' ? 'Take a break' : 'Start working'}
                </button>
                <button
                  onClick={() => setShowMotivation(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer; 