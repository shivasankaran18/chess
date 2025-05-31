"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

type PlayerTimerProps = {
  playerName: string;
  timeLeft: number;  // Time in seconds
  isActive: boolean;
  isCurrentPlayer: boolean;
};

export default function PlayerTimer({ playerName, timeLeft: initialTime, isActive, isCurrentPlayer }: PlayerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    if (isActive && isCurrentPlayer) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isActive, isCurrentPlayer]);
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate percentage of time left
  const timePercentage = (timeLeft / initialTime) * 100;
  
  return (
    <motion.div 
      className={`p-2 rounded-lg ${isCurrentPlayer ? 'border border-emerald-500/50' : ''}`}
      animate={{ 
        borderColor: isCurrentPlayer ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0)', 
        boxShadow: isCurrentPlayer ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none' 
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-3 h-3 rounded-full ${isCurrentPlayer ? 'bg-emerald-500' : 'bg-gray-600'}`}
            animate={{ scale: isCurrentPlayer ? [1, 1.2, 1] : 1 }}
            transition={{ 
              repeat: isCurrentPlayer ? Infinity : 0, 
              duration: 2,
              repeatType: 'loop'
            }}
          />
          <span className="font-medium">{playerName}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-400">
          <Clock size={14} />
          <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          style={{ 
            backgroundColor: timePercentage > 50 ? '#10b981' : timePercentage > 25 ? '#f59e0b' : '#ef4444',
            width: `${timePercentage}%` 
          }}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
