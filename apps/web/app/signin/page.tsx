"use client";
import { AuthProviders } from "@/components/AuthProviders";
import { ChessLogo } from "@/components/ChessLogo";
import { ChessPieces } from "@/components/ChessPieces";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";

export default function SignIn() {
   const { theme, setTheme } = useTheme();
   const router= useRouter();
   const { data: session, status } = useSession();
   if (session?.user) {
      router.push("/home");
   }
   console.log("Current theme:", theme);

   return (
      <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
         <motion.div
            className="relative w-full md:w-1/2 bg-black flex flex-col items-center justify-center p-8 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
         >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0,transparent_70%)]"></div>

            <div className="absolute inset-0 opacity-10">
               <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                  {Array.from({ length: 64 }).map((_, i) => {
                     const row = Math.floor(i / 8);
                     const col = i % 8;
                     const isEven = (row + col) % 2 === 0;
                     return (
                        <div
                           key={i}
                           className={`${isEven ? "bg-green-800" : "bg-black"}`}
                        ></div>
                     );
                  })}
               </div>
            </div>

            <motion.div
               className="relative z-10 max-w-md text-center"
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.4, duration: 0.6 }}
            >
               <ChessLogo className="mx-auto mb-6 w-24 h-24" />
               <h1 className="text-4xl font-bold text-white mb-2">
                  ChessMaster
               </h1>
               <p className="text-emerald-400 text-lg mb-8">
                  Master the game. Elevate your strategy.
               </p>
               <div className="space-y-4 text-gray-300">
                  <p className="text-sm">
                     • Play against players from around the world
                  </p>
                  <p className="text-sm">
                     • Analyze your games with powerful AI
                  </p>
                  <p className="text-sm">
                     • Track your progress and ELO rating
                  </p>
                  <p className="text-sm">• Join tournaments and earn rewards</p>
               </div>
            </motion.div>
         </motion.div>

         <motion.div
            className="w-full md:w-1/2 bg-background flex flex-col items-center justify-center p-6 md:p-12 relative"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
         >
            {JSON.stringify(session?.user)}
            <ModeToggle theme={theme || ""} setTheme={setTheme} />
            <div className="w-full max-w-md space-y-8">
               <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-center"
               >
                  <h2 className="text-3xl font-bold tracking-tight">
                     Welcome to ChessMaster
                  </h2>
                  <p className="text-muted-foreground mt-2">
                     Sign in to start your chess journey
                  </p>
               </motion.div>

               <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="space-y-6"
               >
                  <AuthProviders />

                  <p className="text-center text-sm text-muted-foreground">
                     By signing in, you agree to our{" "}
                     <a
                        href="#"
                        className="text-emerald-500 hover:text-emerald-400 hover:underline"
                     >
                        Terms of Service
                     </a>{" "}
                     and{" "}
                     <a
                        href="#"
                        className="text-emerald-500 hover:text-emerald-400 hover:underline"
                     >
                        Privacy Policy
                     </a>
                  </p>
               </motion.div>
            </div>
         </motion.div>
      </div>
   );
}
