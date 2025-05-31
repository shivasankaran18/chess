"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ChessLogo } from "@/components/ChessLogo";
import { ChessPieces } from "@/components/ChessPieces";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";

export default function LandingPage() {
   const { theme, setTheme } = useTheme();
   const router = useRouter();
   const features = [
      {
         title: "Real-time Matches",
         description: "Play chess in real-time with players worldwide",
      },
      {
         title: "AI Analysis",
         description: "Get instant game analysis from our advanced AI",
      },
      {
         title: "Tournament System",
         description: "Join daily tournaments and win prizes",
      },
      {
         title: "Learning Resources",
         description: "Access comprehensive chess tutorials and strategies",
      },
   ];

   return (
      <div className="min-h-screen bg-background">
         <nav className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
               >
                  <ChessLogo className="w-8 h-8" />
                  <span className="text-xl font-bold">ChessMaster</span>
               </motion.div>

               <div className="flex items-center gap-4">
                  <ModeToggle theme={theme || ""} setTheme={setTheme} />
                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => router.push("/signin")}
                     >
                        Sign In
                     </Button>
                  </motion.div>
               </div>
            </div>
         </nav>

         <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

            <ChessPieces />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />

            <div className="container mx-auto px-4 relative z-10">
               <div className="max-w-4xl mx-auto text-center">
                  <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ duration: 0.6 }}
                     className="mb-8"
                  >
                     <ChessLogo className="w-24 h-24 mx-auto" />
                  </motion.div>
                  <motion.h1
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600"
                  >
                     Master the Game of Kings
                  </motion.h1>
                  <motion.p
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.3 }}
                     className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                  >
                     Join millions of players worldwide in the ultimate online
                     chess experience. Play, learn, and compete in tournaments.
                  </motion.p>
                  <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.4 }}
                     className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                     <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-lg"
                     >
                        Play Now
                     </Button>
                     <Button size="lg" variant="outline" className="text-lg">
                        Learn More
                     </Button>
                  </motion.div>
               </div>
            </div>
         </section>

         <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => (
                     <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-lg bg-card border hover:border-emerald-500/50 transition-colors"
                     >
                        <h3 className="text-xl font-semibold mb-3">
                           {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                           {feature.description}
                        </p>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         <section className="py-16 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_70%)]" />
            <div className="container mx-auto relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  {[
                     { number: "1M+", label: "Active Players" },
                     { number: "10M+", label: "Games Played" },
                     { number: "50K+", label: "Daily Tournaments" },
                  ].map((stat, index) => (
                     <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border"
                     >
                        <div className="text-4xl font-bold text-emerald-500 mb-2">
                           {stat.number}
                        </div>
                        <div className="text-muted-foreground">
                           {stat.label}
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>
         </section>

         <footer className="py-8 px-4 border-t">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
               <p>Made with ♟️ by Shiva for the chess community</p>
            </div>
         </footer>
      </div>
   );
}
