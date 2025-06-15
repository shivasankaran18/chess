"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
   Calendar,
   Trophy,
   Target,
   Clock,
   BarChart3,
   Crown,
   User,
   Filter,
   SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import AppBar from "@/components/AppBar";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Player {
   id: number;
   name: string;
   rating: number;
   avatarUrl: string;
}

interface Game {
   id: number;
   status: "COMPLETED" | "IN_PROGRESS" | "ABANDONED";
   winPlayerId: number | null;
   whitePlayer: Player;
   blackPlayer: Player;
   startAt?: string;
   duration?: number;
}

export default function GamesPage() {
   const { data: session, status } = useSession();
   const [games, setGames] = useState<Game[]>([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState("all");
   const [sortBy, setSortBy] = useState("recent");
   const [theme, setTheme] = useState("dark");
   const router=useRouter();

   const fetchGames = async () => {
      const games = await axios.post("/api/game/played", {
         user_id: session?.user.id,
      });
      setGames(games.data);
   };

   useEffect(() => {
      if (status === "loading") return;
      try {
         console.log(session);
         fetchGames();
         setLoading(false);
      } catch {
         alert("Error fetching games. Please try again later.");
      }
   }, [status]);

   const getUserResult = (game: Game) => {
      if (!session?.user?.id) return "draw";
      const userId = parseInt(session.user.id);

      if (game.winPlayerId === null) return "draw";
      if (game.winPlayerId === userId) return "win";
      return "loss";
   };

   const isUserWhite = (game: Game) => {
      if (!session?.user?.id) return false;
      return game.whitePlayer.id === parseInt(session.user.id);
   };

   const getOpponent = (game: Game) => {
      if (!session?.user?.id) return game.whitePlayer;
      const userId = parseInt(session.user.id);
      return game.whitePlayer.id === userId
         ? game.blackPlayer
         : game.whitePlayer;
   };

   const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${seconds % 60}s`;
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const filteredGames = games.filter((game) => {
      if (filter === "all") return true;
      const result = getUserResult(game);
      return result === filter;
   });

   if (loading) {
      return (
         <div className="min-h-screen bg-background">
            <AppBar theme={theme} setTheme={setTheme} />
            <div className="container mx-auto px-4 py-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                     <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-2">
                           <div className="h-4 bg-muted rounded w-1/2"></div>
                           <div className="h-8 bg-muted rounded"></div>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-3">
                              <div className="h-12 bg-muted rounded"></div>
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-10 bg-muted rounded"></div>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background relative overflow-hidden">
         <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full grid grid-cols-8 grid-rows-8">
               {Array.from({ length: 64 }).map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isEven = (row + col) % 2 === 0;
                  return (
                     <div
                        key={i}
                        className={`${isEven ? "bg-emerald-800" : "bg-background"}`}
                     ></div>
                  );
               })}
            </div>
         </div>

         <AppBar theme={theme} setTheme={setTheme} />

         <div className="container mx-auto px-4 py-8 relative z-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
            >
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                     <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="text-emerald-500" size={32} />
                        Game Analysis
                     </h1>
                     <p className="text-muted-foreground mt-2">
                        Review and analyze your chess games
                     </p>
                  </div>

                  <div className="flex gap-3">
                     <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32">
                           <Filter size={16} />
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All Games</SelectItem>
                           <SelectItem value="win">Wins</SelectItem>
                           <SelectItem value="loss">Losses</SelectItem>
                           <SelectItem value="draw">Draws</SelectItem>
                        </SelectContent>
                     </Select>

                     <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                           <SortDesc size={16} />
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="recent">Recent</SelectItem>
                           <SelectItem value="rating">Rating</SelectItem>
                           <SelectItem value="duration">Duration</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {filteredGames.length === 0 ? (
                  <Card className="text-center py-12">
                     <CardContent>
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                           No games found
                        </h3>
                        <p className="text-muted-foreground">
                           {filter === "all"
                              ? "You haven't played any games yet. Start playing to see your game history!"
                              : `No ${filter === "win" ? "wins" : filter === "loss" ? "losses" : "draws"} found.`}
                        </p>
                     </CardContent>
                  </Card>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredGames.map((game, index) => {
                        const result = getUserResult(game);
                        const opponent = getOpponent(game);
                        const userIsWhite = isUserWhite(game);

                        return (
                           <motion.div
                              key={game.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                           >
                              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
                                 <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
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
                                       <div className="text-right text-sm text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                             <Calendar size={12} />
                                             {game.startAt &&
                                                formatDate(game.startAt)}
                                          </div>
                                          {game.duration && (
                                             <div className="flex items-center gap-1 mt-1">
                                                <Clock size={12} />
                                                {formatDuration(game.duration)}
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </CardHeader>

                                 <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="relative">
                                             <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                   src={
                                                      session?.user?.image || ""
                                                   }
                                                   alt={
                                                      session?.user?.name || ""
                                                   }
                                                />
                                                <AvatarFallback>
                                                   {session?.user?.name
                                                      ?.substring(0, 2)
                                                      .toUpperCase() || "ME"}
                                                </AvatarFallback>
                                             </Avatar>
                                             {result === "win" && (
                                                <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                                             )}
                                          </div>
                                          <div>
                                             <p className="font-medium">You</p>
                                             <p className="text-sm text-muted-foreground">
                                                {userIsWhite
                                                   ? "White"
                                                   : "Black"}{" "}
                                                • Rating:{" "}
                                                {userIsWhite
                                                   ? game.whitePlayer.rating
                                                   : game.blackPlayer.rating}
                                             </p>
                                          </div>
                                       </div>

                                       <div className="text-2xl font-bold text-muted-foreground">
                                          VS
                                       </div>

                                       <div className="flex items-center gap-3">
                                          <div className="text-right">
                                             <p className="font-medium">
                                                {opponent.name}
                                             </p>
                                             <p className="text-sm text-muted-foreground">
                                                {!userIsWhite
                                                   ? "White"
                                                   : "Black"}{" "}
                                                • Rating: {opponent.rating}
                                             </p>
                                          </div>
                                          <div className="relative">
                                             <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                   src={opponent.avatarUrl}
                                                   alt={opponent.name}
                                                />
                                                <AvatarFallback>
                                                   {opponent.name
                                                      .substring(0, 2)
                                                      .toUpperCase()}
                                                </AvatarFallback>
                                             </Avatar>
                                             {result === "loss" && (
                                                <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                                             )}
                                          </div>
                                       </div>
                                    </div>

                                    <Separator />

                                    <Button
                                       className="w-full bg-emerald-500 hover:bg-emerald-600 text-white group-hover:shadow-md transition-all duration-300"
                                       size="sm"
                                       onClick={() =>
                                          router.push(
                                             `/game/analysis/${game.id}`
                                          )
                                       }
                                    >
                                       <BarChart3 size={16} className="mr-2" />
                                       Analyze Game
                                    </Button>
                                 </CardContent>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}
            </motion.div>
         </div>
      </div>
   );
}
