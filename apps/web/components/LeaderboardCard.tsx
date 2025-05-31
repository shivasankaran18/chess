"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
   CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Player = {
   id: number;
   username: string;
   rating: number;
   change: number;
   avatar: string;
};

export default function LeaderboardCard() {
   const [topPlayers, setTopPlayers] = useState<Player[]>([
      {
         id: 1,
         username: "GrandMaster99",
         rating: 2853,
         change: 1,
         avatar:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=GrandMaster99",
      },
      {
         id: 2,
         username: "QueensGambit",
         rating: 2791,
         change: 1,
         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=QueensGambit",
      },
      {
         id: 3,
         username: "KingDefender",
         rating: 2756,
         change: -1,
         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KingDefender",
      },
      {
         id: 4,
         username: "BishopMoves",
         rating: 2735,
         change: 0,
         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BishopMoves",
      },
      {
         id: 5,
         username: "KnightRider",
         rating: 2712,
         change: 1,
         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KnightRider",
      },
   ]);

   return (
      <Card className="h-full shadow-lg overflow-hidden border border-border/50">
         <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
               <Trophy className="h-5 w-5 text-yellow-500" />
               <CardTitle className="text-2xl font-bold">
                  Top 5 Leaderboard
               </CardTitle>
            </div>
            <CardDescription>The best players this week</CardDescription>
         </CardHeader>

         <CardContent className="space-y-4">
            {topPlayers.map((player, index) => (
               <motion.div
                  key={player.id}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
               >
                  <div className="flex items-center gap-3">
                     <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted font-bold text-sm">
                        {index + 1}
                     </div>

                     <Avatar className="h-10 w-10 border-2 border-muted">
                        <AvatarImage
                           src={player.avatar}
                           alt={player.username}
                        />
                        <AvatarFallback>
                           {player.username.substring(0, 2)}
                        </AvatarFallback>
                     </Avatar>

                     <div className="font-medium">{player.username}</div>
                  </div>

                  <div className="flex items-center gap-2">
                     <div className="font-bold">{player.rating}</div>

                     {player.change === 1 && (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                     )}

                     {player.change === -1 && (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                     )}

                     {player.change === 0 && (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                     )}
                  </div>
               </motion.div>
            ))}

            <motion.div
               className="mt-6"
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
            >
               <Button variant="link" className="w-full text-green-500">
                  View Full Leaderboard
               </Button>
            </motion.div>
         </CardContent>
      </Card>
   );
}

function Button({
   variant = "default",
   className,
   children,
   ...props
}: {
   variant?: "default" | "outline" | "link";
   className?: string;
   children: React.ReactNode;
   [key: string]: any;
}) {
   return (
      <button
         className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
            variant === "default" &&
               "bg-primary text-primary-foreground hover:bg-primary/90",
            variant === "outline" &&
               "border border-input hover:bg-accent hover:text-accent-foreground",
            variant === "link" &&
               "underline-offset-4 hover:underline text-primary",
            className,
         )}
         {...props}
      >
         {children}
      </button>
   );
}
