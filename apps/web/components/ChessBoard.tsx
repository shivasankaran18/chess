"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chess } from "chess.js";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Initialize chess.js instance
const chess = new Chess();

export default function ChessBoard() {
   const [board, setBoard] = useState(chess.board());
   const [selectedPiece, setSelectedPiece] = useState<{
      row: number;
      col: number;
   } | null>(null);
   const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
   const [lastMove, setLastMove] = useState<{
      from: string;
      to: string;
   } | null>(null);
   const { theme } = useTheme();

   const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
   const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

   // Get square color based on theme
   const getSquareColor = (row: number, col: number) => {
      const isDark = (row + col) % 2 === 0;
      if (theme === "light") {
         return isDark ? "bg-emerald-200" : "bg-white";
      }
      return isDark ? "bg-[#143321]" : "bg-[#0a1914]";
   };

   // Get algebraic notation for a square
   const getSquareName = (row: number, col: number) => {
      return `${files[col]}${ranks[row]}`;
   };

   // Check if square is in possible moves
   const isValidMove = (row: number, col: number) => {
      if (!selectedPiece) return false;
      const targetSquare = getSquareName(row, col);
      return possibleMoves.includes(targetSquare);
   };

   // Check if square is the last move
   const isLastMove = (row: number, col: number) => {
      if (!lastMove) return false;
      const squareName = getSquareName(row, col);
      return lastMove.from === squareName || lastMove.to === squareName;
   };

   // Handle piece selection
   const handleSquareClick = (row: number, col: number) => {
      const piece = board[row][col];

      if (!selectedPiece && piece) {
         setSelectedPiece({ row, col });
         const validMoves = chess.moves({
            square: getSquareName(row, col),
            verbose: true,
         });
         setPossibleMoves(validMoves.map((move) => move.to));
         return;
      }

      if (selectedPiece) {
         if (selectedPiece.row === row && selectedPiece.col === col) {
            setSelectedPiece(null);
            setPossibleMoves([]);
            return;
         }

         if (isValidMove(row, col)) {
            const fromSquare = getSquareName(
               selectedPiece.row,
               selectedPiece.col,
            );
            const toSquare = getSquareName(row, col);

            try {
               chess.move({
                  from: fromSquare,
                  to: toSquare,
                  promotion: "q",
               });

               setBoard(chess.board());
               setLastMove({ from: fromSquare, to: toSquare });
               setSelectedPiece(null);
               setPossibleMoves([]);
            } catch (e) {
               console.error("Invalid move:", e);
            }
         } else {
            if (
               piece &&
               piece.color === board[selectedPiece.row][selectedPiece.col].color
            ) {
               setSelectedPiece({ row, col });
               const validMoves = chess.moves({
                  square: getSquareName(row, col),
                  verbose: true,
               });
               setPossibleMoves(validMoves.map((move) => move.to));
            } else {
               setSelectedPiece(null);
               setPossibleMoves([]);
            }
         }
      }
   };

   // Get piece image path
   const getPieceImage = (piece: any) => {
      if (!piece) return null;
      const color = piece.color === "w" ? "w" : "b";
      const type = piece.type;
      return `/${color}${type}.png`;
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
                  row.map((piece, colIndex) => (
                     <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        className={cn(
                           getSquareColor(rowIndex, colIndex),
                           "relative flex items-center justify-center cursor-pointer transition-colors duration-200",
                           selectedPiece?.row === rowIndex &&
                           selectedPiece?.col === colIndex &&
                           (theme === "light"
                              ? "bg-emerald-300/50"
                              : "bg-emerald-700/30"),
                           isValidMove(rowIndex, colIndex) &&
                           (theme === "light"
                              ? "bg-emerald-200/50"
                              : "bg-emerald-500/20"),
                           isLastMove(rowIndex, colIndex) &&
                           (theme === "light"
                              ? "ring-2 ring-inset ring-emerald-400/60"
                              : "ring-2 ring-inset ring-emerald-400/40"),
                        )}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        whileHover={{
                           backgroundColor: isValidMove(rowIndex, colIndex)
                              ? theme === "light"
                                 ? "rgba(16, 185, 129, 0.2)"
                                 : "rgba(16, 185, 129, 0.3)"
                              : "",
                        }}
                        transition={{ duration: 0.2 }}
                     >
                        {piece && (
                           <motion.div
                              className="w-full h-full flex items-center justify-center"
                              initial={false}
                              animate={{
                                 scale:
                                    selectedPiece?.row === rowIndex &&
                                       selectedPiece?.col === colIndex
                                       ? 1.1
                                       : 1,
                              }}
                              transition={{
                                 type: "spring",
                                 stiffness: 300,
                                 damping: 15,
                              }}
                           >
                              <img
                                 src={getPieceImage(piece) || ""}
                                 alt={`${piece.color}${piece.type}`}
                                 className="w-[70%] h-[70%] object-contain"
                              />
                           </motion.div>
                        )}

                        {isValidMove(rowIndex, colIndex) && !piece && (
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

                        {isValidMove(rowIndex, colIndex) && piece && (
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
                  )),
               )}
            </div>
         </motion.div>
      </div>
   );
}
