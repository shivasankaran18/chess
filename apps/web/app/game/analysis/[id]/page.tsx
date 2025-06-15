"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
   ArrowLeft,
   Send,
   Bot,
   User,
   Clock,
   Trophy,
   ChevronRight,
   Loader2,
   MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AppBar from "@/components/AppBar";
import axios from "axios";
import { CHAT_MESSAGE, INIT_CHAT } from "utils/constants";
import { CHAT_URL } from "@/config";

interface Player {
   id: number;
   username: string | null;
   name: string;
   email: string;
   provider: string;
   rating: number;
   createdAt: string;
   avatarUrl: string;
}

interface GameMove {
   id: number;
   gameId: number;
   moveNumber: number;
   san: string;
   comments: string | null;
   timeTaken: number;
   createdAt: string;
   playerId: number;
}

interface Game {
   id: number;
   whitePlayerId: number;
   blackPlayerId: number;
   status: "COMPLETED" | "IN_PROGRESS" | "ABANDONED";
   winPlayerId: number | null;
   startingFen: string;
   currentFen: string;
   startAt: string;
   endAt: string | null;
   whitePlayerRatingChange: number;
   blackPlayerRatingChange: number;
   moves: GameMove[];
   whitePlayer: Player;
   blackPlayer: Player;
}

interface GameResponse {
   game: Game;
}

interface ParsedMove {
   moveNumber: number;
   white: string;
   black?: string;
}

interface ChatMessage {
   type: "human" | "ai";
   content: string;
   timestamp: Date;
}

export default function GameAnalysisPage() {
   const params = useParams();
   const router = useRouter();
   const { data: session,status } = useSession();
   const [theme, setTheme] = useState("dark");
   const [game, setGame] = useState<Game | null>(null);
   const [moves, setMoves] = useState<ParsedMove[]>([]);
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [inputMessage, setInputMessage] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const [isSending, setIsSending] = useState(false);
   const [ws, setWs] = useState<WebSocket | null>(null);
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const [threadId, setThreadId] = useState<string | null>(null);

   useEffect(() => {
      const fetchGame = async () => {
         try {
            const res = await axios.post("/api/game/analysis", {
               gameId: params.id,
            });
            const gameData = res.data.game;
            setGame(gameData);

            const parsedMoves = parseMoves(
               gameData.moves,
               gameData.whitePlayerId,
            );
            setMoves(parsedMoves);
            setIsLoading(false);
         } catch (error) {
            console.error("Error fetching game:", error);
            setIsLoading(false);
         }
      };

      fetchGame();
   }, [params.id]);

   useEffect(() => {
      if(status==='loading')
      {
         return; 
      }
      const websocket = new WebSocket(CHAT_URL);

      websocket.onopen = () => {
         console.log("WebSocket connected");
         setWs(websocket);
         websocket.send(JSON.stringify({
            type:INIT_CHAT,
            user:{
               name: session?.user?.name || "",
               id: session?.user?.id || "",
               email:session?.user?.email ||""
            },
            game_id: params.id,

         }))
      };

      websocket.onmessage = (event) => {
         const data = JSON.parse(event.data);
         if(data.type===INIT_CHAT)
         {
            setThreadId(data.thread_id)
         }
         if (data.type === CHAT_MESSAGE) {
            setMessages((prev) => [
               ...prev,
               {
                  type: "ai",
                  content: data.message,
                  timestamp: new Date(),
               },
            ]);
            setIsSending(false);
         }
      };

      websocket.onclose = () => {
         console.log("WebSocket disconnected");
         setWs(null);
      };

      websocket.onerror = (error) => {
         console.error("WebSocket error:", error);
         setIsSending(false);
      };

      return () => {
         websocket.close();
      };
   }, [status]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const parseMoves = (
      gameMovesArray: GameMove[],
      whitePlayerId: number,
   ): ParsedMove[] => {
      const movesByNumber: {
         [key: number]: { white?: string; black?: string };
      } = {};

      gameMovesArray.forEach((move) => {
         if (!movesByNumber[move.moveNumber]) {
            movesByNumber[move.moveNumber] = {};
         }

         if (move.playerId === whitePlayerId) {
            movesByNumber[move.moveNumber].white = move.san;
         } else {
            movesByNumber[move.moveNumber].black = move.san;
         }
      });

      const parsedMoves: ParsedMove[] = [];
      Object.keys(movesByNumber)
         .map((num) => parseInt(num))
         .sort((a, b) => a - b)
         .forEach((moveNum) => {
            const moveData = movesByNumber[moveNum];
            parsedMoves.push({
               moveNumber: moveNum,
               white: moveData.white || "",
               black: moveData.black,
            });
         });

      return parsedMoves;
   };

   const sendMessage = () => {
      if (!inputMessage.trim() || !ws || isSending) return;

      console.log(inputMessage)

      const userMessage: ChatMessage = {
         type: "human",
         content: inputMessage,
         timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);

      // Send message to WebSocket with game data
      ws.send(
         JSON.stringify({
            type: CHAT_MESSAGE,
            message:inputMessage,
            game_id: params.id,
            threadId:threadId
            },
         ),
      );

      setInputMessage("");
   };

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   };

   const getUserResult = () => {
      if (!game || !session?.user?.id) return "draw";
      const userId = parseInt(session.user.id);

      if (game.winPlayerId === null) return "draw";
      if (game.winPlayerId === userId) return "win";
      return "loss";
   };

   const isUserWhite = () => {
      if (!game || !session?.user?.id) return false;
      return game.whitePlayerId === parseInt(session.user.id);
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const getGameDuration = () => {
      if (!game?.startAt || !game?.endAt) return null;
      const start = new Date(game.startAt);
      const end = new Date(game.endAt);
      const durationMs = end.getTime() - start.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-background">
            <AppBar theme={theme} setTheme={setTheme} />
            <div className="h-[calc(100vh-64px)] flex">
               <div className="w-[30%] border-r bg-card/50 p-4">
                  <div className="animate-pulse space-y-4">
                     <div className="h-8 bg-muted rounded"></div>
                     <div className="space-y-2">
                        {[...Array(10)].map((_, i) => (
                           <div key={i} className="h-6 bg-muted rounded"></div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="flex-1 p-4">
                  <div className="animate-pulse space-y-4">
                     <div className="h-8 bg-muted rounded w-1/3"></div>
                     <div className="h-96 bg-muted rounded"></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (!game) {
      return (
         <div className="min-h-screen bg-background">
            <AppBar theme={theme} setTheme={setTheme} />
            <div className="container mx-auto px-4 py-8">
               <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Game not found</h1>
                  <Button onClick={() => router.back()}>Go Back</Button>
               </div>
            </div>
         </div>
      );
   }

   const result = getUserResult();
   const userIsWhite = isUserWhite();
   const gameDuration = getGameDuration();

   return (
      <div className="min-h-screen bg-background relative">
         <div className="absolute inset-0 opacity-5">
            <div
               className="w-full h-full"
               style={{
                  backgroundImage: `
                 repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 50% / 40px 40px
               `,
               }}
            ></div>
         </div>

         <AppBar theme={theme} setTheme={setTheme} />

         <div className="h-[calc(100vh-64px)] flex relative z-10">
            <div className="w-[30%] border-r bg-card/50 backdrop-blur-sm flex flex-col">
               <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-4">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="hover:bg-emerald-500/10 hover:text-emerald-500"
                     >
                        <ArrowLeft size={18} />
                     </Button>
                     <h2 className="font-semibold">Game Analysis</h2>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <Badge
                           variant={
                              result === "win"
                                 ? "default"
                                 : result === "loss"
                                   ? "destructive"
                                   : "secondary"
                           }
                           className={
                              result === "win"
                                 ? "bg-emerald-500 hover:bg-emerald-600"
                                 : ""
                           }
                        >
                           {result === "win"
                              ? "Victory"
                              : result === "loss"
                                ? "Defeat"
                                : "Draw"}
                        </Badge>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                           <Clock size={12} />
                           {formatDate(game.startAt)}
                        </div>
                     </div>

                     {gameDuration && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                           <Trophy size={12} />
                           Duration: {gameDuration}
                        </div>
                     )}

                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                           <Avatar className="h-6 w-6">
                              <AvatarImage src={game.whitePlayer.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                 {game.whitePlayer.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                              </AvatarFallback>
                           </Avatar>
                           <span className="font-medium">
                              {game.whitePlayer.name}
                           </span>
                           <span className="text-muted-foreground">
                              ({game.whitePlayer.rating})
                           </span>
                           {game.whitePlayerRatingChange > 0 && (
                              <span className="text-emerald-500 text-xs">
                                 +{game.whitePlayerRatingChange}
                              </span>
                           )}
                           {game.whitePlayerRatingChange < 0 && (
                              <span className="text-red-500 text-xs">
                                 {game.whitePlayerRatingChange}
                              </span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                           <Avatar className="h-6 w-6">
                              <AvatarImage src={game.blackPlayer.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                 {game.blackPlayer.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                              </AvatarFallback>
                           </Avatar>
                           <span className="font-medium">
                              {game.blackPlayer.name}
                           </span>
                           <span className="text-muted-foreground">
                              ({game.blackPlayer.rating})
                           </span>
                           {game.blackPlayerRatingChange > 0 && (
                              <span className="text-emerald-500 text-xs">
                                 +{game.blackPlayerRatingChange}
                              </span>
                           )}
                           {game.blackPlayerRatingChange < 0 && (
                              <span className="text-red-500 text-xs">
                                 {game.blackPlayerRatingChange}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-hidden">
                  <div className="p-4 pb-2">
                     <h3 className="font-medium text-sm text-muted-foreground mb-3">
                        Game Moves
                     </h3>
                  </div>
                  <ScrollArea className="h-full px-4 pb-4">
                     <div className="space-y-1">
                        {moves.map((move, index) => (
                           <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                 duration: 0.3,
                                 delay: index * 0.02,
                              }}
                              className="grid grid-cols-3 gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                           >
                              <div className="font-medium text-muted-foreground">
                                 {move.moveNumber}.
                              </div>
                              <div className="font-mono font-medium">
                                 {move.white}
                              </div>
                              <div className="font-mono font-medium">
                                 {move.black || ""}
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </ScrollArea>
               </div>
            </div>

            {/* Right Side - Chat Interface (70%) */}
            <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm">
               {/* Chat Header */}
               <div className="p-6 border-b">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Bot className="text-white" size={20} />
                     </div>
                     <div>
                        <h1 className="text-xl font-semibold">
                           Chess Analysis Assistant
                        </h1>
                        <p className="text-sm text-muted-foreground">
                           Ask questions about your game moves, strategy, and
                           analysis
                        </p>
                     </div>
                  </div>
               </div>

               {/* Messages */}
               <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full p-6">
                     <div className="space-y-6">
                        {messages.length === 0 && (
                           <div className="text-center py-12">
                              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                 <MessageSquare className="h-8 w-8 text-emerald-500" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">
                                 Start analyzing your game
                              </h3>
                              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                 Ask me about your moves, strategy, or any
                                 aspect of this game. I'll help you understand
                                 what happened and how to improve!
                              </p>
                           </div>
                        )}

                        {messages.map((message, index) => (
                           <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex gap-4 ${
                                 message.type === "human"
                                    ? "justify-end"
                                    : "justify-start"
                              }`}
                           >
                              {message.type === "ai" && (
                                 <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-emerald-500 text-white">
                                       <Bot size={16} />
                                    </AvatarFallback>
                                 </Avatar>
                              )}

                              <div
                                 className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                    message.type === "human"
                                       ? "bg-emerald-500 text-white"
                                       : "bg-muted"
                                 }`}
                              >
                                 <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                 </p>
                                 <p
                                    className={`text-xs mt-2 ${
                                       message.type === "human"
                                          ? "text-emerald-100"
                                          : "text-muted-foreground"
                                    }`}
                                 >
                                    {message.timestamp.toLocaleTimeString([], {
                                       hour: "2-digit",
                                       minute: "2-digit",
                                    })}
                                 </p>
                              </div>

                              {message.type === "human" && (
                                 <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage
                                       src={session?.user?.image || ""}
                                    />
                                    <AvatarFallback>
                                       <User size={16} />
                                    </AvatarFallback>
                                 </Avatar>
                              )}
                           </motion.div>
                        ))}

                        {isSending && (
                           <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-4 justify-start"
                           >
                              <Avatar className="h-8 w-8 mt-1">
                                 <AvatarFallback className="bg-emerald-500 text-white">
                                    <Bot size={16} />
                                 </AvatarFallback>
                              </Avatar>
                              <div className="bg-muted rounded-2xl px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">
                                       Analyzing your game...
                                    </span>
                                 </div>
                              </div>
                           </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                     </div>
                  </ScrollArea>
               </div>

               {/* Input Area */}
               <div className="p-6 border-t bg-background/80">
                  <div className="flex gap-3">
                     <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your game moves, strategy, or analysis..."
                        disabled={isSending || !ws}
                        className="flex-1 rounded-full border-2 focus:border-emerald-500"
                     />
                     <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isSending || !ws}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
                        size="default"
                     >
                        {isSending ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                           <Send size={16} />
                        )}
                     </Button>
                  </div>
                  {!ws && (
                     <p className="text-xs text-muted-foreground mt-2 text-center">
                        Connecting to analysis server...
                     </p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
