"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Clock, ArrowLeft, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import ChessBoard from "@/components/ChessBoard";
import MovesList from "@/components/MovesList";
import PlayerTimer from "@/components/PlayerTimer";
import WaitingRoom from "@/components/WaitingRoom";
import { WS_URL } from "@/config";
import {
   GAME_START,
   GAME_JOIN,
   INIT_GAME,
   GAME_CREATED,
   GAME_STARTED,
} from "utils/constants";
import { useSession } from "next-auth/react";
import { Chess } from "chess.js";
import { useParams } from "next/navigation";

export default function GamePage() {
   const { theme } = useTheme();
   const [gameStarted, setGameStarted] = useState(false);
   const [gameLink, setGameLink] = useState(
      "https://chessmaster.com/game/a1b2c3d4",
   );
   const [copied, setCopied] = useState(false);
   const socketRef = useRef<WebSocket | null>(null);
   const [chess, setChess] = useState(new Chess());
   const [board, setBoard] = useState(chess.board());
   const [loading, setLoading] = useState(true);
   const [id, setId] = useState<number>(0);
   const { data: session, status } = useSession();
   const params = useParams();
   const gameId = params?.id?.toString();
   

   useEffect(() => {
      console.log(status);
      if (status === "loading") return;

      if (socketRef.current) {
         socketRef.current.close();
      }

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
         socketRef.current = ws;
         console.log("WebSocket connected");

         if (gameId !== "new") {
            ws.send(
               JSON.stringify({
                  type: GAME_JOIN,
                  gameId,
                  user: session?.user,
                  status,
               }),
            );
         } else {
            ws.send(
               JSON.stringify({
                  type: INIT_GAME,
                  gameId,
                  user: session?.user,
               }),
            );
         }
      };

      setTimeout(()=>{
         ws.send(
            JSON.stringify({
               type:"summa"
            }),
         );
      },4000)

      ws.onmessage = (event) => {
         const data = JSON.parse(event.data);
         const msg = data.type;
         console.log("Received:", data);

         switch (msg) {
            case GAME_CREATED:
               setLoading(false);
               break;

            case GAME_STARTED:
               console.log("Game Started!", data);
               setId(data.gameId);
               setGameStarted(true);
               setLoading(false);
               break;
            case "summa":
               console.log(data);

            default:
               console.log("Unhandled message type:", msg);
         }
      };

      return () => {
         console.log("hello")
         ws.close();
      };
   }, [status]);

   const copyGameLink = () => {
      navigator.clipboard.writeText(gameLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };
   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
            <div className="text-lg font-semibold">Loading...</div>
         </div>
      );
   }

   console.log(gameStarted)

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
                  <ChessBoard
                     board={board}
                     setBoard={setBoard}
                     chess={chess}
                     setChess={setChess}
                     socket={socketRef.current}
                     gameId={id}
                  />
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
