"use client";

import { motion } from "framer-motion";
import { Play, Clock, Swords, Brain, Check as Chess } from "lucide-react";
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PlayNowSection() {
   return (
      <Card className="shadow-lg overflow-hidden border border-border/50 bg-gradient-to-br from-emerald-950/50 to-background">
         <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
               Ready to Play?
            </CardTitle>
         </CardHeader>

         <CardContent className="space-y-8">
            <motion.div
               className="flex justify-center"
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
            >
               <Button className="w-full h-24 text-3xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent transform -skew-x-12 group-hover:animate-shine" />
                  <Play size={32} className="mr-3" />
                  Play Now
               </Button>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
               <GameModeButton
                  icon={<Clock size={24} />}
                  title="Rapid"
                  description="10 min"
               />
               <GameModeButton
                  icon={<Swords size={24} />}
                  title="Blitz"
                  description="5 min"
               />
               <GameModeButton
                  icon={<Brain size={24} />}
                  title="Puzzle"
                  description="Daily challenge"
               />
               <GameModeButton
                  icon={<Chess size={24} />}
                  title="Custom"
                  description="Your rules"
               />
            </div>
         </CardContent>

         <CardFooter className="pt-0 opacity-80 text-sm text-center">
            <p className="w-full text-emerald-400">1,842 players online now</p>
         </CardFooter>
      </Card>
   );
}

interface GameModeButtonProps {
   icon: React.ReactNode;
   title: string;
   description: string;
}

function GameModeButton({ icon, title, description }: GameModeButtonProps) {
   return (
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
         <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-1 border border-emerald-800/50 bg-emerald-950/30 hover:bg-emerald-900/30"
         >
            <div className="text-emerald-400">{icon}</div>
            <div className="font-medium">{title}</div>
            <div className="text-xs text-emerald-400/70">{description}</div>
         </Button>
      </motion.div>
   );
}
