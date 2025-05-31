"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Clock, ArrowLeft, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import ChessBoard from "@/components/ChessBoard";
import MovesList from "@/components/MovesList";
import PlayerTimer from "@/components/PlayerTimer";
import WaitingRoom from "@/components/WaitingRoom";
import { WS_URL } from "@/config";
import {GAME_START,GAME_JOIN} from "types"
import { useSession } from "next-auth/react";

type gameProps = {
   gameId: string;
};

export default function GamePage({ params }: { params: gameProps }) {
   const { theme } = useTheme();
   const [gameStarted, setGameStarted] = useState(false);
   const [gameLink, setGameLink] = useState(
      "https://chessmaster.com/game/a1b2c3d4",
   );
   const [copied, setCopied] = useState(false);
   const [socket, setSocket] = useState<WebSocket | null>(null);
   const {data:session,status} = useSession();

   if (params.gameId != "new") {
      setGameStarted(true);
   }
   useEffect(()=>{
      const ws=new WebSocket(WS_URL);
      ws.onopen = () => {
         setSocket(ws);
      }
     

   },[])
   if(socket)
   {
       if(params.gameId!="new")
      {
         socket.send(JSON.stringify({
            type:GAME_JOIN,
            gameId: params.gameId,
            user:session?.user


         }))
      }
      else
      {
         socket.send(JSON.stringify({
            type:GAME_START,
            gameId: params.gameId,
            user:session?.user
         }))
      }

   }
     

   const copyGameLink = () => {
      navigator.clipboard.writeText(gameLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="min-h-screen bg-[#111111] text-white flex flex-col"
      >
         <header className="p-4 border-b border-emerald-900/30">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
               <Link href="/" className="flex items-center gap-2">
                  <motion.div
                     className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
                     whileHover={{ scale: 1.05 }}
                  >
                     <span className="text-black font-bold text-xl">♞</span>
                  </motion.div>
                  <span className="text-xl font-bold text-emerald-500">
                     ChessMaster
                  </span>
               </Link>

               <div className="flex items-center gap-4">
                  <Link
                     href="/home"
                     className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                     <ArrowLeft size={16} />
                     <span>Exit Game</span>
                  </Link>
               </div>
            </div>
         </header>

         <main className="flex-grow p-4 md:p-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
            <motion.div
               className="flex-grow flex items-center justify-center"
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.5 }}
            >
               <div className="w-full max-w-2xl mx-auto">
                  <ChessBoard />
               </div>
            </motion.div>

            <motion.div
               className="lg:w-80 w-full"
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
            >
               <div className="h-full flex flex-col gap-4">
                  {/* Player 1 Timer */}
                  <motion.div
                     initial={{ y: -10, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4"
                  >
                     <PlayerTimer
                        playerName="Player 1"
                        timeLeft={600}
                        isActive={gameStarted}
                        isCurrentPlayer={true}
                     />
                  </motion.div>

                  {/* Game Information */}
                  <div className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4 flex-grow flex flex-col">
                     {!gameStarted ? (
                        <WaitingRoom
                           gameLink={gameLink}
                           onCopy={copyGameLink}
                           copied={copied}
                        />
                     ) : (
                        <MovesList />
                     )}
                  </div>

                  {/* Player 2 Timer */}
                  <motion.div
                     initial={{ y: 10, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4"
                  >
                     <PlayerTimer
                        playerName="Player 2"
                        timeLeft={600}
                        isActive={gameStarted}
                        isCurrentPlayer={false}
                     />
                  </motion.div>

                  <motion.button
                     whileHover={{ scale: 1.03 }}
                     whileTap={{ scale: 0.97 }}
                     className="w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg font-medium transition-colors mt-2"
                  >
                     Resign Game
                  </motion.button>
               </div>
            </motion.div>
         </main>
      </motion.div>
   );
}
