"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import ChessBoard from "@/components/ChessBoard";
import MovesList from "@/components/MovesList";
import PlayerTimer from "@/components/PlayerTimer";
import WaitingRoom from "@/components/WaitingRoom";
import ChatComponent from "@/components/ChatComponent";
import { WS_URL } from "@/config";
import {
   GAME_JOIN,
   INIT_GAME,
   GAME_CREATED,
   GAME_STARTED,
   GAME_MOVE,
   GAME_OVER,
   GAME_MSG,
} from "utils/constants";
import { useSession } from "next-auth/react";
import { Chess } from "chess.js";
import { useParams, useRouter } from "next/navigation";
import { Message, Moves } from "utils/types";

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
   const [moves, setMoves] = useState<Moves>([]);
   const [messages, setMessages] = useState<Message[]>([]);
   const { data: session, status } = useSession();
   const router = useRouter();

   const params = useParams();
   const gameId = params?.id?.toString();

   useEffect(() => {
      console.log(status);
      if (status === "loading") return;

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

            case GAME_MOVE:
               console.log("Move received:", data.move);
               chess.move(data.move);
               setBoard(chess.board());
               setMoves(data.moves);
               break;

            case GAME_OVER:
               setGameStarted(false);
               alert(`Game Over! ${data.winner} wins!`);
               setChess(new Chess());
               setBoard(new Chess().board());
               router.push("/home");

            case GAME_MSG:
               console.log("Message received:", data.messages);
               setMessages(data.messages);

            default:
               console.log("Unhandled message type:", msg);
         }
      };

      return () => {
         console.log("hello");
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

   console.log(gameStarted);

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

         <main className="flex-grow p-4 md:p-8 flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto w-full">
            <div className="flex-grow flex flex-col gap-6">
               <motion.div
                  className="flex items-center justify-center"
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

               {gameStarted && (
                  <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.7, duration: 0.5 }}
                     className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4 max-w-2xl mx-auto w-full"
                  >
                     <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-emerald-400 font-medium">
                           Game Moves
                        </h3>
                     </div>
                     <MovesList moves={moves} />
                  </motion.div>
               )}
            </div>

            <motion.div
               className="xl:w-80 w-full"
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
            >
               <div className="h-full flex flex-col gap-4">
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

                  <div className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4 flex-grow flex flex-col min-h-[400px]">
                     {!gameStarted ? (
                        <WaitingRoom
                           gameLink={gameLink}
                           onCopy={copyGameLink}
                           copied={copied}
                        />
                     ) : (
                        <ChatComponent
                           gameId={id}
                           socket={socketRef.current}
                           messages={messages}
                           user={session?.user}
                        />
                     )}
                  </div>

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
