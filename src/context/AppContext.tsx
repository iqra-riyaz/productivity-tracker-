'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface AppContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  completedPomodoros: number;
  setCompletedPomodoros: (count: number) => void;
  timerSettings: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
  };
  setTimerSettings: (settings: { pomodoro: number; shortBreak: number; longBreak: number }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });

  const [completedPomodoros, setCompletedPomodoros] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completedPomodoros');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [timerSettings, setTimerSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timerSettings');
      return saved ? JSON.parse(saved) : {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
      };
    }
    return {
      pomodoro: 25,
      shortBreak: 5,
      longBreak: 15,
    };
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save completed pomodoros to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedPomodoros', completedPomodoros.toString());
    }
  }, [completedPomodoros]);

  // Save timer settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timerSettings', JSON.stringify(timerSettings));
    }
  }, [timerSettings]);

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        completedPomodoros,
        setCompletedPomodoros,
        timerSettings,
        setTimerSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 