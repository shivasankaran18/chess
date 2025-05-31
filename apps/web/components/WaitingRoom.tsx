"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Users, Link } from 'lucide-react';

type WaitingRoomProps = {
  gameLink: string;
  onCopy: () => void;
  copied: boolean;
};

export default function WaitingRoom({ gameLink, onCopy, copied }: WaitingRoomProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          yoyo: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
      >
        <Users className="text-emerald-400" size={28} />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-semibold text-emerald-400 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Waiting for another player to join...
      </motion.h3>
      
      <motion.p 
        className="text-gray-400 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Share this link with a friend to play together
      </motion.p>
      
      <motion.div 
        className="w-full bg-[#060606] border border-emerald-900/50 rounded-lg p-3 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex-grow overflow-hidden text-left flex items-center">
          <Link size={14} className="text-emerald-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-400 truncate">{gameLink}</p>
        </div>
        
        <motion.button 
          className="bg-emerald-900/50 hover:bg-emerald-800/50 text-white p-2 rounded-md flex items-center gap-1"
          onClick={onCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check size={16} />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Copy size={16} />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="w-full mt-8 pt-6 border-t border-gray-800 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-gray-500">
          Game will start automatically when another player joins
        </p>
      </motion.div>
    </motion.div>
  );
}
