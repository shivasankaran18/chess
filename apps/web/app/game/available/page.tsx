"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Crown, Star, Users, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

type GamePlayer = {
   id: number;
   whitePlayer: {
      name: string | null;
      rating: number;
      avatarUrl: string | null;
   };
};
const dummyGames: GamePlayer[] = [
   {
      id: 1,
      whitePlayer: {
         name: "Magnus Carlsen",
         rating: 2831,
         avatarUrl:
            "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      },
   },
   {
      id: 2,
      whitePlayer: {
         name: "Hikaru Nakamura",
         rating: 2736,
         avatarUrl:
            "https://lh3.googleusercontent.com/a/ACg8ocJgWHz6SyDzJGTLKFShTSfpxPH560XnUi6IITrCNWREHU2TGg=s96-c",
      },
   },
   {
      id: 3,
      whitePlayer: {
         name: "Fabiano Caruana",
         rating: 2783,
         avatarUrl:
            "https://lh3.googleusercontent.com/a/ACg8ocJgWHz6SyDzJGTLKFShTSfpxPH560XnUi6IITrCNWREHU2TGg=s96-c",
      },
   },
];
export default function AvailableGamesPage() {
   const router = useRouter();
   const [games, setGames] = useState<GamePlayer[]>([]);
   const [loading, setLoading] = useState(true);

   async function fetchGames() {
      const res = await axios.get("/api/game/available");
      setGames(res.data);
      setLoading(false);
   }

   useEffect(() => {
      try {
         fetchGames();
      } catch (error) {}
   }, []);

   const getRatingColor = (rating: number) => {
      if (rating >= 2800) return "text-amber-400";
      if (rating >= 2700) return "text-purple-400";
      if (rating >= 2600) return "text-emerald-400";
      if (rating >= 2500) return "text-blue-400";
      if (rating >= 2400) return "text-cyan-400";
      if (rating >= 2300) return "text-indigo-400";
      if (rating >= 2200) return "text-rose-400";
      if (rating >= 2000) return "text-orange-400";
      return "text-slate-400";
   };

   const getRatingTitle = (rating: number) => {
      if (rating >= 2800) return "Super Grandmaster";
      if (rating >= 2700) return "Elite Grandmaster";
      if (rating >= 2600) return "Grandmaster";
      if (rating >= 2500) return "Strong International Master";
      if (rating >= 2400) return "International Master";
      if (rating >= 2300) return "FIDE Master";
      if (rating >= 2200) return "Candidate Master";
      if (rating >= 2000) return "Expert";
      return "Class A Player";
   };

   const handleChallenge = (id: number) => {
      router.push(`/game/play/${id}`);
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-emerald-400 text-lg font-semibold">
               Loading available games...
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
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

         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />

         <div className="relative z-10 p-6 border-b border-emerald-800/20">
            <div className="container mx-auto flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/")}
                        className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                     >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                     </Button>
                  </motion.div>
                  <div>
                     <h1 className="text-3xl font-bold text-emerald-400">
                        Classical Games Available
                     </h1>
                     <p className="text-sm text-muted-foreground">
                        Choose your opponent for a classical chess match
                     </p>
                  </div>
               </div>
               <div className="flex items-center space-x-2 text-emerald-400">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">
                     {games.length} players waiting
                  </span>
               </div>
            </div>
         </div>

         <main className="flex-1 container mx-auto px-6 py-8 z-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="bg-card/80 backdrop-blur-sm border border-emerald-800/20 rounded-xl overflow-hidden shadow-2xl"
            >
               <div className="bg-emerald-950/50 border-b border-emerald-800/20 px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                     <div className="col-span-1"></div>
                     <div className="col-span-4">Player</div>
                     <div className="col-span-3 text-center">Rating</div>
                     <div className="col-span-4 text-center">Action</div>
                  </div>
               </div>

               <div className="divide-y divide-emerald-800/10">
                  {games.map((player, index) => (
                     <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{
                           backgroundColor: "rgba(16, 185, 129, 0.05)",
                        }}
                        className="grid grid-cols-12 gap-4 items-center px-6 py-5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                     >
                        <div className="col-span-1">
                           <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-emerald-600/50 shadow-lg">
                                 <AvatarImage
                                    src={player.whitePlayer.avatarUrl || " "}
                                    alt={player.whitePlayer.name || " "}
                                 />
                                 <AvatarFallback className="bg-emerald-600 text-white font-bold text-sm">
                                    {player.whitePlayer.name ||
                                       " "
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                 </AvatarFallback>
                              </Avatar>
                              {player.whitePlayer.rating >= 2800 && (
                                 <Crown className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 drop-shadow-lg" />
                              )}
                           </div>
                        </div>

                        <div className="col-span-4">
                           <h3 className="font-semibold text-lg text-foreground hover:text-emerald-400 transition-colors">
                              {player.whitePlayer.name || "Unknown Player"}
                           </h3>
                           <p className="text-sm text-muted-foreground">
                              Classical Player
                           </p>
                        </div>

                        <div className="col-span-3 text-center">
                           <div className="flex items-center justify-center space-x-2">
                              <Star
                                 className={`h-5 w-5 ${getRatingColor(player.whitePlayer.rating)}`}
                              />
                              <span
                                 className={`font-bold text-xl ${getRatingColor(player.whitePlayer.rating)}`}
                              >
                                 {player.whitePlayer.rating}
                              </span>
                           </div>
                           <div className="text-xs text-muted-foreground mt-1">
                              {getRatingTitle(player.whitePlayer.rating)}
                           </div>
                        </div>

                        <div className="col-span-4 text-center">
                           <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                           >
                              <Button
                                 onClick={() => handleChallenge(player.id)}
                                 className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
                              >
                                 <Swords className="mr-2 h-4 w-4" />
                                 Challenge
                              </Button>
                           </motion.div>
                        </div>
                     </motion.div>
                  ))}
               </div>

               {games.length === 0 && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="text-center py-16"
                  >
                     <div className="text-6xl mb-4 text-emerald-400/50">♟️</div>
                     <h3 className="text-xl font-semibold text-foreground mb-2">
                        No players available
                     </h3>
                     <p className="text-muted-foreground">
                        Check back later for classical game opponents
                     </p>
                  </motion.div>
               )}
            </motion.div>
         </main>
      </div>
   );
}
