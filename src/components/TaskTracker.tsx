'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackTaskCompletion } from '@/lib/analyticsService';
import { useApp } from '@/context/AppContext';

// Types
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskTracker = () => {
  const { tasks, setTasks } = useApp();
  const [newTask, setNewTask] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false
    };

    setTasks([...tasks, task]);
    setNewTask('');
    trackTaskCompletion(false); // Track new task as remaining
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const newCompleted = !task.completed;
        trackTaskCompletion(newCompleted); // Track task completion status
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete && !taskToDelete.completed) {
      trackTaskCompletion(false); // Track task deletion as remaining
    }
    
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Tasks</h2>
      
      {/* Add Task Form */}
      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-lavender"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-lavender text-white rounded-lg hover:bg-lavender/90 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-4 p-4 rounded-lg shadow-sm transition-all ${
                task.completed 
                  ? 'bg-lavender/10 dark:bg-gray-800/50' 
                  : 'bg-white/80 dark:bg-gray-900/80'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-lavender border-lavender'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                {task.completed && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 ${
                  task.completed
                    ? 'text-gray-400 line-through'
                    : 'text-gray-800 dark:text-white'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskTracker; 