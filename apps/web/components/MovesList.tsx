"use client";

import { motion } from "framer-motion";
import { Moves } from "utils/types";


export default function MovesList({moves}:{moves: Moves}) {
   

   const container = {
      hidden: { opacity: 0 },
      show: {
         opacity: 1,
         transition: {
            staggerChildren: 0.1,
         },
      },
   };

   const item = {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 },
   };

   return (
      <div className="flex flex-col h-full">
         <h2 className="text-xl font-semibold text-emerald-400 mb-4">
            Game Moves
         </h2>

         <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-gray-800 pr-2">
            <motion.table
               variants={container}
               initial="hidden"
               animate="show"
               className="w-full text-left border-separate border-spacing-y-2"
            >
               <thead>
                  <tr className="text-gray-400 text-sm">
                     <th className="px-2">#</th>
                     <th className="px-2">SAN</th>
                     <th className="px-2">Player</th>
                  </tr>
               </thead>
               <tbody>
                  {moves.map((move, index) => (
                     <motion.tr
                        key={index}
                        variants={item}
                        className={`rounded-md ${
                           index === moves.length - 1
                              ? "bg-emerald-900/30 border border-emerald-500/30"
                              : "bg-gray-900/30"
                        }`}
                     >
                        <td className="px-2 py-1 text-sm text-gray-300">
                           {Math.floor(index / 2) + 1}
                           {index % 2 === 1 ? ".." : ""}
                        </td>
                        <td className="px-2 py-1 font-mono text-white">
                           {move.san || "-"}
                        </td>
                       
                        <td
                           className={`px-2 py-1 text-xs ${move.player === "Player 1" ? "text-blue-400" : "text-orange-400"}`}
                        >
                           {move.player}
                        </td>
                     </motion.tr>
                  ))}
               </tbody>
            </motion.table>
         </div>
      </div>
   );
}
