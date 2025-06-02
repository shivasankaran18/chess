"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { GAME_MOVE, WAIT_FOR_THE_SECOND_PLAYER } from "utils/constants";

type board = ({
   square: Square;
   type: PieceSymbol;
   color: Color;
} | null)[][];

export default function ChessBoard({
   board,
   setBoard,
   chess,
   setChess,
   socket,
   gameId,
}: {
   board: board;
   setBoard: React.Dispatch<React.SetStateAction<board>>;
   chess: Chess;
   setChess: React.Dispatch<React.SetStateAction<Chess>>;
   socket?: WebSocket | null;
   gameId: number;
}) {
   const { theme } = useTheme();
   const [from, setFrom] = useState<Square | null>(null);
   const [to, setTo] = useState<Square | null>(null);
   const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
   const [lastMove, setLastMove] = useState<{
      from: string;
      to: string;
   } | null>(null);

   const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
   const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

   const getSquareName = (row: number, col: number) =>
      `${files[col]}${ranks[row]}`;

   const getCoordsFromSquare = (square: string) => {
      const file = square[0];
      const rank = square[1];
      return {
         row: ranks.indexOf(rank),
         col: files.indexOf(file),
      };
   };

   const getSquareColor = (row: number, col: number) => {
      const isDark = (row + col) % 2 === 0;
      return theme === "light"
         ? isDark
            ? "bg-emerald-200"
            : "bg-white"
         : isDark
           ? "bg-[#143321]"
           : "bg-[#0a1914]";
   };

   const handleSquareClick = (row: number, col: number) => {
      const square = getSquareName(row, col);
      const piece = board[row][col];

      // Step 1: Select the piece
      if (!from) {
         if (!piece) return;
         const moves = chess.moves({ square, verbose: true });
         setFrom(square);
         setPossibleMoves(moves.map((m) => m.to));
         return;
      }

      // Step 2: Clicked on same piece to deselect
      if (from === square) {
         setFrom(null);
         setPossibleMoves([]);
         return;
      }

      // Step 3: Change selected piece
      if (piece && piece.color === chess.get(from)?.color) {
         const moves = chess.moves({ square, verbose: true });
         setFrom(square);
         setPossibleMoves(moves.map((m) => m.to));
         return;
      }

      // Step 4: Clicked on a valid destination
      if (possibleMoves.includes(square)) {
         setTo(square);
         console.log("hello");
         console.log(gameId)

         if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
               JSON.stringify({
                  type: GAME_MOVE,
                  gameId,
                  move: {
                     from,
                     to: square,
                  },
               }),
            );
         }
      } else {
         setFrom(null);
         setPossibleMoves([]);
      }
   };

   if (socket) {
      socket.onmessage = (event) => {
         const data = JSON.parse(event.data);
         switch (data.type) {
            case WAIT_FOR_THE_SECOND_PLAYER:
               alert("Waiting for the second player to join");
               break;
            case GAME_MOVE:
               let { from, to } = data.move;
               console.log(data.move)
               chess.move({ from, to, promotion: "q" });
               setBoard(chess.board());
               setLastMove({ from, to });
         }

         setFrom(null);
         setTo(null);
         setPossibleMoves([]);
      };
   }

   const getPieceImage = (piece: any) => {
      if (!piece) return null;
      return `/${piece.color}${piece.type}.png`;
   };

   return (
      <div className="relative w-full pb-[100%]">
         <motion.div
            className={cn(
               "absolute inset-0 rounded-lg overflow-hidden",
               theme === "light"
                  ? "shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-200"
                  : "shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-emerald-900/50",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
         >
            <div className="w-full h-full grid grid-cols-8 grid-rows-8">
               {board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                     const square = getSquareName(rowIndex, colIndex);
                     const isFrom = from === square;
                     const isTo = to === square;
                     const isValid = possibleMoves.includes(square);
                     const isLast =
                        lastMove?.from === square || lastMove?.to === square;

                     return (
                        <motion.div
                           key={square}
                           className={cn(
                              getSquareColor(rowIndex, colIndex),
                              "relative flex items-center justify-center cursor-pointer",
                              isFrom &&
                                 (theme === "light"
                                    ? "bg-emerald-300/50"
                                    : "bg-emerald-700/30"),
                              isValid &&
                                 (theme === "light"
                                    ? "bg-emerald-200/50"
                                    : "bg-emerald-500/20"),
                              isLast &&
                                 (theme === "light"
                                    ? "ring-2 ring-inset ring-emerald-400/60"
                                    : "ring-2 ring-inset ring-emerald-400/40"),
                           )}
                           onClick={() => handleSquareClick(rowIndex, colIndex)}
                           whileHover={{
                              backgroundColor: isValid
                                 ? theme === "light"
                                    ? "rgba(16, 185, 129, 0.2)"
                                    : "rgba(16, 185, 129, 0.3)"
                                 : "",
                           }}
                           transition={{ duration: 0.2 }}
                        >
                           {piece && (
                              <motion.img
                                 src={getPieceImage(piece) || ""}
                                 alt={`${piece.color}${piece.type}`}
                                 className="w-[70%] h-[70%] object-contain"
                                 animate={{
                                    scale: isFrom ? 1.1 : 1,
                                 }}
                                 transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                 }}
                              />
                           )}

                           {isValid && !piece && (
                              <motion.div
                                 className={cn(
                                    "w-3 h-3 rounded-full",
                                    theme === "light"
                                       ? "bg-emerald-400/80"
                                       : "bg-emerald-400/60",
                                 )}
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                 }}
                              />
                           )}

                           {isValid && piece && (
                              <motion.div
                                 className={cn(
                                    "absolute inset-0 rounded-sm ring-2",
                                    theme === "light"
                                       ? "ring-emerald-400/80"
                                       : "ring-emerald-400/60",
                                 )}
                                 initial={{ scale: 0.8, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                 }}
                              />
                           )}

                           {colIndex === 0 && (
                              <span
                                 className={cn(
                                    "absolute left-1 top-1 text-xs",
                                    theme === "light"
                                       ? "text-emerald-600/90"
                                       : "text-emerald-400/70",
                                 )}
                              >
                                 {ranks[rowIndex]}
                              </span>
                           )}
                           {rowIndex === 7 && (
                              <span
                                 className={cn(
                                    "absolute right-1 bottom-1 text-xs",
                                    theme === "light"
                                       ? "text-emerald-600/90"
                                       : "text-emerald-400/70",
                                 )}
                              >
                                 {files[colIndex]}
                              </span>
                           )}
                        </motion.div>
                     );
                  }),
               )}
            </div>
         </motion.div>
      </div>
   );
}
