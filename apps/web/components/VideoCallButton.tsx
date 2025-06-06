import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Video,
   VideoOff,
   Phone,
   PhoneOff,
   Maximize2,
   Share,
} from "lucide-react";

interface VideoCallButtonProps {
   isCallActive?: boolean;
   onToggleCall?: () => void;
   onExpandCall?: () => void;
}

export default function VideoCallButton({
   isCallActive = false,
   onToggleCall,
   onExpandCall,
}: VideoCallButtonProps) {
   const [isHovered, setIsHovered] = useState(false);

   return (
      <div className="fixed bottom-6 right-6 z-50">
         <motion.div
            className="flex flex-col items-end gap-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
         >
            <AnimatePresence>
               {isCallActive && isHovered && (
                  <motion.button
                     initial={{ opacity: 0, y: 10, scale: 0.8 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.8 }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={onExpandCall}
                     className="w-12 h-12 bg-[#0a0a0a] border border-emerald-900/30 rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors shadow-lg backdrop-blur-sm"
                  >
                     <Maximize2 size={20} />
                  </motion.button>
               )}
            </AnimatePresence>

            <motion.div className="relative">
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleCall}
                  className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-xl backdrop-blur-sm
              ${
                 isCallActive
                    ? "bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30"
                    : "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30"
              }
            `}
               >
                  <motion.div
                     animate={{ rotate: isCallActive ? 135 : 0 }}
                     transition={{ duration: 0.3 }}
                  >
                     {isCallActive ? (
                        <PhoneOff size={24} />
                     ) : (
                        <Share size={24} />
                     )}
                  </motion.div>
               </motion.button>

               <AnimatePresence>
                  {!isCallActive && isHovered && (
                     <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] border border-emerald-900/30 rounded-lg px-3 py-2 whitespace-nowrap"
                     >
                        <span className="text-emerald-400 text-sm font-medium">
                           Share Video
                        </span>
                        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#0a0a0a] border-r border-b border-emerald-900/30 rotate-45"></div>
                     </motion.div>
                  )}
               </AnimatePresence>

               <AnimatePresence>
                  {isCallActive && isHovered && (
                     <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] border border-red-900/30 rounded-lg px-3 py-2 whitespace-nowrap"
                     >
                        <span className="text-red-400 text-sm font-medium">
                           End Call
                        </span>
                        <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#0a0a0a] border-r border-b border-red-900/30 rotate-45"></div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </motion.div>

            <AnimatePresence>
               {isCallActive && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute bottom-0 right-0 rounded-full pointer-events-none"
                  >
                     <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30"
                     />
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </div>
   );
}
