"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Users, Trophy, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./ModeToggle";
import { signOut, useSession } from "next-auth/react";

interface AppBarProps {
   theme: string;
   setTheme: (theme: string) => void;
}

export default function AppBar({ theme, setTheme }: AppBarProps) {
   const router = useRouter();
   const [rating, setRating] = useState(1842);
   const { data: session, status } = useSession();

   return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
         <div className="container flex h-16 items-center justify-between">
            <motion.div
               className="flex items-center gap-2"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">♞</span>
               </div>
               <span className="font-bold text-xl">ChessMaster</span>
            </motion.div>

            <motion.div
               className="flex items-center gap-4"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.3 }}
            >
               <div className="hidden md:flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                     <Settings size={18} />
                     <span className="hidden lg:inline">Settings</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="gap-2">
                     <Users size={18} />
                     <span className="hidden lg:inline">Friends</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="gap-2">
                     <Trophy size={18} />
                     <span className="hidden lg:inline">Leaderboard</span>
                  </Button>
               </div>

               <ModeToggle theme={theme} setTheme={setTheme} />

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        variant="ghost"
                        className="relative h-8 rounded-full"
                        size="sm"
                     >
                        <Avatar className="h-8 w-8">
                           <AvatarImage
                              src={session?.user?.image || ""}
                              alt={session?.user?.name || ""}
                           />
                           <AvatarFallback>
                              {session?.user?.name ||
                                 "".substring(0, 2).toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:inline-flex ml-2 gap-1">
                           {session?.user?.name || "Guest"}
                           <span className="text-muted-foreground">
                              ({rating})
                           </span>
                           <ChevronDown size={16} />
                        </span>
                     </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                     <div className="flex items-center justify-start p-2 md:hidden">
                        <div className="flex flex-col space-y-1 leading-none">
                           <p className="font-medium">
                              {session?.user?.name || "Guest"}
                           </p>
                           <p className="w-[200px] truncate text-sm text-muted-foreground">
                              Rating: {rating}
                           </p>
                        </div>
                     </div>

                     <DropdownMenuSeparator className="md:hidden" />

                     <DropdownMenuItem className="md:hidden">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                     </DropdownMenuItem>

                     <DropdownMenuItem className="md:hidden">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Friends</span>
                     </DropdownMenuItem>

                     <DropdownMenuItem className="md:hidden">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Leaderboard</span>
                     </DropdownMenuItem>

                     <DropdownMenuSeparator />

                     <DropdownMenuItem
                        onClick={async () => {
                            await signOut({ redirect: false });
                           router.push("/api/auth/signin");
                        }}
                     >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </motion.div>
         </div>
      </header>
   );
}
