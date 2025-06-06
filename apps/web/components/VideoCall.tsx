import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface VideoCallProps {
   isUser?: boolean;
   isVideoEnabled?: boolean;
   isAudioEnabled?: boolean;
   onToggleVideo?: () => void;
   onToggleAudio?: () => void;
   onEndCall?: () => void;
   playerName?: string;
   videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoCall({
   isUser = false,
   isVideoEnabled = true,
   isAudioEnabled = true,
   onToggleVideo,
   onToggleAudio,
   onEndCall,
   playerName = "Player",
   videoRef
}: VideoCallProps) {


   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.8 }}
         className={`
        relative bg-[#0a0a0a] border border-emerald-900/30 rounded-xl overflow-hidden
        ${isUser ? "w-64 h-48" : "w-72 h-54"}
        shadow-2xl backdrop-blur-sm
      `}
      >
         <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isUser}
            className={`
          w-full h-full object-cover
        `}
         />

         {(!isVideoEnabled ) && (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-black/40 flex items-center justify-center">
               <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 text-3xl font-bold">
                     {playerName.charAt(0).toUpperCase()}
                  </span>
               </div>
            </div>
         )}

         <div className="absolute inset-0 bg-black/10 pointer-events-none" />

         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white text-base font-medium truncate drop-shadow-lg">
               {playerName}
            </p>
         </div>

         {isUser && (
            <div className="absolute top-3 right-3 flex gap-2">
               <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleVideo}
                  className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${
                 isVideoEnabled
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
              }
              backdrop-blur-sm border transition-all duration-200
            `}
               >
                  {isVideoEnabled ? (
                     <Video size={16} />
                  ) : (
                     <VideoOff size={16} />
                  )}
               </motion.button>

               <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleAudio}
                  className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${
                 isAudioEnabled
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
              }
              backdrop-blur-sm border transition-all duration-200
            `}
               >
                  {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
               </motion.button>
            </div>
         )}

         <div className="absolute top-3 left-3 flex gap-2">
            {!isVideoEnabled && (
               <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30"
               >
                  <VideoOff size={14} className="text-red-400" />
               </motion.div>
            )}
            {!isAudioEnabled && (
               <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30"
               >
                  <MicOff size={14} className="text-red-400" />
               </motion.div>
            )}
         </div>

         <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
            <motion.div
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-2 h-2 bg-emerald-500 rounded-full"
            />
         </div>
      </motion.div>
   );
}
