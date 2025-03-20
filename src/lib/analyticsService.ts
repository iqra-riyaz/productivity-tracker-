// Types
export interface DailyStats {
  date: string;
  focusTime: number;
  completedTasks: number;
  remainingTasks: number;
  pomodorosCompleted: number;
}

export interface WeeklyStats {
  weekStart: string;
  totalFocusTime: number;
  totalCompletedTasks: number;
  totalRemainingTasks: number;
  totalPomodorosCompleted: number;
}

// Get today's date in YYYY-MM-DD format
const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get week start date (Monday) in YYYY-MM-DD format
const getWeekStart = (): string => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// Initialize or get daily stats
const getDailyStats = (): { dailyStats: DailyStats, allDailyStats: DailyStats[] } => {
  const today = getToday();
  const stats = localStorage.getItem('dailyStats');
  const parsedStats: DailyStats[] = stats ? JSON.parse(stats) : [];
  
  // Find today's stats or create new ones
  let todayIndex = parsedStats.findIndex(stat => stat.date === today);
  let dailyStats: DailyStats;
  
  if (todayIndex === -1) {
    // Create new stats for today
    dailyStats = {
      date: today,
      focusTime: 0,
      completedTasks: 0,
      remainingTasks: 0,
      pomodorosCompleted: 0
    };
    
    // Add today's stats and keep only last 7 days
    parsedStats.push(dailyStats);
    const updatedStats = parsedStats.slice(-7);
    localStorage.setItem('dailyStats', JSON.stringify(updatedStats));
    
    return { dailyStats, allDailyStats: updatedStats };
  } else {
    // Use existing stats for today
    dailyStats = parsedStats[todayIndex];
    return { dailyStats, allDailyStats: parsedStats };
  }
};

// Initialize or get weekly stats
const getWeeklyStats = (): { weeklyStats: WeeklyStats, allWeeklyStats: WeeklyStats[] } => {
  const weekStart = getWeekStart();
  const stats = localStorage.getItem('weeklyStats');
  const parsedStats: WeeklyStats[] = stats ? JSON.parse(stats) : [];
  
  // Find this week's stats or create new ones
  let weekIndex = parsedStats.findIndex(stat => stat.weekStart === weekStart);
  let weeklyStats: WeeklyStats;
  
  if (weekIndex === -1) {
    // Create new stats for this week
    weeklyStats = {
      weekStart,
      totalFocusTime: 0,
      totalCompletedTasks: 0,
      totalRemainingTasks: 0,
      totalPomodorosCompleted: 0
    };
    
    // Add this week's stats and keep only last 4 weeks
    parsedStats.push(weeklyStats);
    const updatedStats = parsedStats.slice(-4);
    localStorage.setItem('weeklyStats', JSON.stringify(updatedStats));
    
    return { weeklyStats, allWeeklyStats: updatedStats };
  } else {
    // Use existing stats for this week
    weeklyStats = parsedStats[weekIndex];
    return { weeklyStats, allWeeklyStats: parsedStats };
  }
};

// Track completed pomodoro session
export const trackPomodoro = (minutes: number | string) => {
  // Convert minutes to number if it's a string
  const minutesNum = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  
  if (isNaN(minutesNum)) {
    console.error('Invalid minutes value for trackPomodoro:', minutes);
    return;
  }
  
  try {
    // Get daily and weekly stats
    const { dailyStats, allDailyStats } = getDailyStats();
    const { weeklyStats, allWeeklyStats } = getWeeklyStats();
    
    // Update daily stats
    dailyStats.focusTime += minutesNum;
    dailyStats.pomodorosCompleted += 1;
    
    // Update weekly stats
    weeklyStats.totalFocusTime += minutesNum;
    weeklyStats.totalPomodorosCompleted += 1;
    
    // Find index of stats to update
    const dailyIndex = allDailyStats.findIndex(stat => stat.date === dailyStats.date);
    const weeklyIndex = allWeeklyStats.findIndex(stat => stat.weekStart === weeklyStats.weekStart);
    
    // Update arrays with new stats
    if (dailyIndex !== -1) allDailyStats[dailyIndex] = dailyStats;
    if (weeklyIndex !== -1) allWeeklyStats[weeklyIndex] = weeklyStats;
    
    // Save updated stats to localStorage
    localStorage.setItem('dailyStats', JSON.stringify(allDailyStats));
    localStorage.setItem('weeklyStats', JSON.stringify(allWeeklyStats));
    
    console.log('Tracked pomodoro:', minutesNum, 'minutes. Updated stats:', {
      daily: dailyStats,
      weekly: weeklyStats
    });
  } catch (error) {
    console.error('Error tracking pomodoro:', error);
  }
};

// Track task completion
export const trackTaskCompletion = (completed: boolean) => {
  try {
    // Get daily and weekly stats
    const { dailyStats, allDailyStats } = getDailyStats();
    const { weeklyStats, allWeeklyStats } = getWeeklyStats();
    
    // Update daily stats
    if (completed) {
      dailyStats.completedTasks += 1;
    } else {
      dailyStats.remainingTasks += 1;
    }
    
    // Update weekly stats
    if (completed) {
      weeklyStats.totalCompletedTasks += 1;
    } else {
      weeklyStats.totalRemainingTasks += 1;
    }
    
    // Find index of stats to update
    const dailyIndex = allDailyStats.findIndex(stat => stat.date === dailyStats.date);
    const weeklyIndex = allWeeklyStats.findIndex(stat => stat.weekStart === weeklyStats.weekStart);
    
    // Update arrays with new stats
    if (dailyIndex !== -1) allDailyStats[dailyIndex] = dailyStats;
    if (weeklyIndex !== -1) allWeeklyStats[weeklyIndex] = weeklyStats;
    
    // Save updated stats to localStorage
    localStorage.setItem('dailyStats', JSON.stringify(allDailyStats));
    localStorage.setItem('weeklyStats', JSON.stringify(allWeeklyStats));
    
    console.log('Tracked task completion:', completed, 'Updated stats:', {
      daily: dailyStats,
      weekly: weeklyStats
    });
  } catch (error) {
    console.error('Error tracking task completion:', error);
  }
};

// Get all stats for display
export const getAllStats = (): { daily: DailyStats[]; weekly: WeeklyStats[] } => {
  try {
    const dailyStats = localStorage.getItem('dailyStats');
    const weeklyStats = localStorage.getItem('weeklyStats');
    
    // Initialize with empty arrays if not available
    const parsedDaily = dailyStats ? JSON.parse(dailyStats) : [];
    const parsedWeekly = weeklyStats ? JSON.parse(weeklyStats) : [];
    
    // Ensure we have at least the current day in stats
    const today = getToday();
    if (!parsedDaily.some((stat: DailyStats) => stat.date === today)) {
      getDailyStats(); // This will create today's entry
      return getAllStats(); // Recursive call to get fresh data
    }
    
    return {
      daily: parsedDaily,
      weekly: parsedWeekly
    };
  } catch (error) {
    console.error('Error getting all stats:', error);
    return { daily: [], weekly: [] };
  }
};

// Legacy function for backward compatibility
export const getStats = () => {
  try {
    const data = getAllStats();
    return {
      daily: data.daily.reduce((acc: any, curr: DailyStats) => {
        acc[curr.date] = curr;
        return acc;
      }, {}),
      weekly: data.weekly.length > 0 ? data.weekly[data.weekly.length - 1] : {
        totalFocusTime: 0,
        totalTasksCompleted: 0,
        totalPomodoros: 0
      }
    };
  } catch (error) {
    console.error('Error in getStats:', error);
    return {
      daily: {},
      weekly: {
        totalFocusTime: 0,
        totalTasksCompleted: 0,
        totalPomodoros: 0
      }
    };
  }
}; 