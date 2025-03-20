'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getAllStats, DailyStats, WeeklyStats } from '@/lib/analyticsService';
import { useApp } from '@/context/AppContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Stats {
  daily: DailyStats[];
  weekly: WeeklyStats[];
}

const Analytics = () => {
  const { tasks, completedPomodoros } = useApp();
  const [stats, setStats] = useState<Stats>({ daily: [], weekly: [] });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Create observer to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Get counts for active vs completed tasks
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const remainingTasksCount = tasks.filter(task => !task.completed).length;

  // Load stats with useEffect
  useEffect(() => {
    const loadStats = () => {
      try {
        const data = getAllStats();
        console.log('Loaded stats:', data);
        setStats(data);
        setRefreshKey(prev => prev + 1);  // Force re-render when data changes
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [completedPomodoros, completedTasksCount]); // Re-run when these values change

  // Sort daily stats by date for proper chronological display
  const sortedDailyStats = useMemo(() => {
    return [...stats.daily].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [stats.daily]);

  // Prepare data for daily focus time chart
  const dailyFocusData = {
    labels: sortedDailyStats.map(stat => {
      // Format date as "Jan 10" for better readability
      const date = new Date(stat.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Focus Time (minutes)',
        data: sortedDailyStats.map(stat => stat.focusTime),
        borderColor: '#9370DB',
        backgroundColor: 'rgba(147, 112, 219, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare data for task completion chart - use real-time data from context
  const taskCompletionData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completedTasksCount, remainingTasksCount],
        backgroundColor: ['#9370DB', '#87CEEB'],
        borderWidth: 0,
      },
    ],
  };

  // Chart options with conditional text color for dark mode
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb))',
          font: {
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: true,
        text: 'Daily Focus Time',
        color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb))',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.raw} minutes`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb), 0.8)',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(var(--foreground-rgb), 0.1)',
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes',
          color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb))',
        },
        ticks: {
          color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb), 0.8)',
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(var(--foreground-rgb), 0.1)',
        }
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb))',
          font: {
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: true,
        text: 'Task Completion Status',
        color: isDarkMode ? '#fff' : 'rgb(var(--foreground-rgb))',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#fff' : '#000',
        bodyColor: isDarkMode ? '#fff' : '#000',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
      },
    },
  };

  // Get the weekly stats for display
  const currentWeekStats = stats.weekly[stats.weekly.length - 1] || {
    totalFocusTime: 0,
    totalCompletedTasks: 0,
    totalRemainingTasks: 0,
    totalPomodorosCompleted: 0,
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Focus Time Chart */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="h-[300px]">
            {sortedDailyStats.length > 0 ? (
              <Line data={dailyFocusData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>Complete Pomodoro sessions to see your focus time stats</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="h-[300px] flex items-center justify-center">
            {(completedTasksCount > 0 || remainingTasksCount > 0) ? (
              <Doughnut data={taskCompletionData} options={doughnutChartOptions} />
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                <p>Add tasks to see completion stats</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="md:col-span-2 bg-white/50 dark:bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Focus Time</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {currentWeekStats.totalFocusTime} min
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {completedTasksCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Tasks</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {remainingTasksCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pomodoros Completed</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {completedPomodoros}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 