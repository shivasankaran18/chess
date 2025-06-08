"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlayNowSection() {
  const router = useRouter();

  return (
    <Card className="border-emerald-800/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-emerald-400 text-center">
          Ready to Play?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              onClick={() => router.push("/game/available")}
            >
              <Users className="mr-2 h-5 w-5" />
              Join a Game
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              onClick={() => router.push("/game/play/new")}
            >
              <Play className="mr-2 h-5 w-5" />
              Create a Game
            </Button>
          </motion.div>
        </div>
        
        <div className="text-center text-sm text-emerald-400 font-medium">
          1,842 players online now
        </div>
      </CardContent>
    </Card>
  );
}
