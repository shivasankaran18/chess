"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

type Move = {
  notation: string;
  player: 'Player 1' | 'Player 2';
  timestamp: Date;
};

export default function MovesList() {
  // Sample moves data - in a real app this would come from game state
  const [moves, setMoves] = useState<Move[]>([
    { notation: 'e4', player: 'Player 1', timestamp: new Date() },
    { notation: 'e5', player: 'Player 2', timestamp: new Date() },
    { notation: 'Nf3', player: 'Player 1', timestamp: new Date() },
    { notation: 'Nc6', player: 'Player 2', timestamp: new Date() },
    { notation: 'Bc4', player: 'Player 1', timestamp: new Date() }
  ]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-emerald-400 mb-4">Game Moves</h2>
      
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-gray-800 pr-2">
        <motion.div 
          className="space-y-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {moves.map((move, index) => (
            <motion.div
              key={index}
              variants={item}
              className={`p-2 rounded-md flex justify-between ${
                index === moves.length - 1 ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-gray-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">
                  {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'}
                </span>
                <span className="font-mono font-medium text-white">{move.notation}</span>
              </div>
              <span className={`text-xs ${move.player === 'Player 1' ? 'text-blue-400' : 'text-orange-400'}`}>
                {move.player}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
