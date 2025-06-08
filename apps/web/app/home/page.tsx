"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AppBar from "@/components/AppBar";
import PlayNowSection from "@/components/PlayNowSection";
import LeaderboardCard from "@/components/LeaderboardCard";
import UserStatsCard from "@/components/UserStatsCard";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export default function Dashboard() {
   const { theme, setTheme } = useTheme();
   const {data:session, status} = useSession();

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

         <AppBar theme={theme || ""} setTheme={setTheme}/>

         <main className="flex-1 container mx-auto px-4 py-6 z-10">
            <motion.div
               className="flex flex-col gap-6 max-w-4xl mx-auto"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
            >
               <div className="w-full">
                  <PlayNowSection />
               </div>

               <div className="w-full">
                  <LeaderboardCard />
               </div>

               <div className="w-full">
                  <UserStatsCard username={"Guest"} />
               </div>
            </motion.div>
         </main>
      </div>
   );
}
