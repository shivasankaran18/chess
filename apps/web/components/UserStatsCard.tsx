"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
   BarChartIcon as ChartIcon,
   Crown,
   Clock,
   X,
   Check,
   Sparkles,
   ChevronRight,
} from "lucide-react";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
   CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Custom icons
const DrawIcon = () => (
   <div className="h-4 w-4 rounded-full border-2 border-yellow-500"></div>
);

type GameResult = "win" | "loss" | "draw";

type Game = {
   id: string;
   opponent: {
      username: string;
      avatar: string;
      rating: number;
   };
   date: Date;
   result: GameResult;
   ratingChange: number;
};

interface UserStatsCardProps {
   username: string;
}

export default function UserStatsCard({ username }: UserStatsCardProps) {
   const [recentGames, setRecentGames] = useState<Game[]>([
      {
         id: "game1",
         opponent: {
            username: "ChessWizard",
            avatar:
               "https://api.dicebear.com/7.x/avataaars/svg?seed=ChessWizard",
            rating: 1875,
         },
         date: new Date(2025, 2, 15),
         result: "win",
         ratingChange: 8,
      },
      {
         id: "game2",
         opponent: {
            username: "TacticalQueen",
            avatar:
               "https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalQueen",
            rating: 1923,
         },
         date: new Date(2025, 2, 14),
         result: "loss",
         ratingChange: -12,
      },
      {
         id: "game3",
         opponent: {
            username: "PawnMaster",
            avatar:
               "https://api.dicebear.com/7.x/avataaars/svg?seed=PawnMaster",
            rating: 1756,
         },
         date: new Date(2025, 2, 14),
         result: "win",
         ratingChange: 6,
      },
      {
         id: "game4",
         opponent: {
            username: "KnightMoves",
            avatar:
               "https://api.dicebear.com/7.x/avataaars/svg?seed=KnightMoves",
            rating: 1842,
         },
         date: new Date(2025, 2, 13),
         result: "draw",
         ratingChange: 0,
      },
      {
         id: "game5",
         opponent: {
            username: "RookTactics",
            avatar:
               "https://api.dicebear.com/7.x/avataaars/svg?seed=RookTactics",
            rating: 1795,
         },
         date: new Date(2025, 2, 12),
         result: "win",
         ratingChange: 7,
      },
   ]);

   return (
      <Card className="h-full shadow-lg overflow-hidden border border-border/50">
         <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
               <ChartIcon className="h-5 w-5 text-green-500" />
               <CardTitle className="text-2xl font-bold">Your Stats</CardTitle>
            </div>
            <CardDescription>
               Track your progress and performance
            </CardDescription>
         </CardHeader>

         <CardContent>
            <Tabs defaultValue="history" className="w-full">
               <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="history">Game History</TabsTrigger>
                  <TabsTrigger value="stats">Performance</TabsTrigger>
               </TabsList>

               <TabsContent value="history" className="space-y-3">
                  {recentGames.map((game, index) => (
                     <motion.div
                        key={game.id}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                     >
                        <div className="flex items-center gap-3">
                           <ResultIcon result={game.result} />

                           <Avatar className="h-8 w-8">
                              <AvatarImage
                                 src={game.opponent.avatar}
                                 alt={game.opponent.username}
                              />
                              <AvatarFallback>
                                 {game.opponent.username.substring(0, 2)}
                              </AvatarFallback>
                           </Avatar>

                           <div>
                              <div className="font-medium">
                                 {game.opponent.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                 {format(game.date, "MMM d")} • Rating:{" "}
                                 {game.opponent.rating}
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center">
                           <Badge
                              className={cn(
                                 "font-mono",
                                 game.ratingChange > 0
                                    ? "bg-green-500/20 text-green-500 hover:bg-green-500/20 hover:text-green-500"
                                    : game.ratingChange < 0
                                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-500"
                                      : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500",
                              )}
                           >
                              {game.ratingChange > 0 ? "+" : ""}
                              {game.ratingChange}
                           </Badge>
                        </div>
                     </motion.div>
                  ))}

                  <motion.div
                     className="mt-4"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                  >
                     <Button variant="outline" className="w-full">
                        View All Games
                        <ChevronRight className="ml-2 h-4 w-4" />
                     </Button>
                  </motion.div>
               </TabsContent>

               <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                     <StatCard
                        title="Rating"
                        value="1842"
                        icon={<Crown className="h-4 w-4 text-yellow-500" />}
                        trend="+23 this month"
                        trendUp={true}
                     />

                     <StatCard
                        title="Win Rate"
                        value="64%"
                        icon={<Sparkles className="h-4 w-4 text-blue-500" />}
                        trend="Last 20 games"
                     />

                     <StatCard
                        title="Games Played"
                        value="142"
                        icon={<Chess className="h-4 w-4 text-purple-500" />}
                        trend="Since Jan 2025"
                     />

                     <StatCard
                        title="Avg. Time"
                        value="4:32"
                        icon={<Clock className="h-4 w-4 text-orange-500" />}
                        trend="Per move"
                     />
                  </div>

                  <motion.div
                     className="mt-4"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                  >
                     <Button variant="outline" className="w-full">
                        Detailed Analysis
                        <ChevronRight className="ml-2 h-4 w-4" />
                     </Button>
                  </motion.div>
               </TabsContent>
            </Tabs>
         </CardContent>
      </Card>
   );
}

function ResultIcon({ result }: { result: GameResult }) {
   switch (result) {
      case "win":
         return (
            <Check className="h-5 w-5 p-0.5 rounded-full bg-green-500/20 text-green-500" />
         );
      case "loss":
         return (
            <X className="h-5 w-5 p-0.5 rounded-full bg-red-500/20 text-red-500" />
         );
      case "draw":
         return (
            <div className="h-5 w-5 flex items-center justify-center">
               <DrawIcon />
            </div>
         );
   }
}

function StatCard({
   title,
   value,
   icon,
   trend,
   trendUp,
}: {
   title: string;
   value: string;
   icon: React.ReactNode;
   trend: string;
   trendUp?: boolean;
}) {
   return (
      <div className="p-4 rounded-lg border border-border/50 bg-card flex flex-col">
         <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
               {title}
            </span>
            {icon}
         </div>
         <div className="text-2xl font-bold">{value}</div>
         <div
            className={cn(
               "text-xs mt-1",
               trendUp ? "text-green-500" : "text-muted-foreground",
            )}
         >
            {trend}
         </div>
      </div>
   );
}
function Chess(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
         {...props}
      >
         <path d="m14 11-5 5" />
         <path d="m5 20 5-5" />
         <path d="m16 4-4 4" />
         <path d="m3 13 4 4" />
         <path d="M11 16a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z" />
         <path d="M12 12a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z" />
         <path d="M12 8a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z" />
         <path d="M16 16a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z" />
         <path d="M8 8a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z" />
         <path d="M8 12a1 1 0 1 0 0-2 1 1 0 1 0 0 2Z" />
         <path d="M19.3 17.7a2.5 2.5 0 0 1-3.16 3.83 2.53 2.53 0 0 1-1.14-2V12" />
         <path d="M9 12V7.5A2.5 2.5 0 0 1 14 7v5" />
      </svg>
   );
}
