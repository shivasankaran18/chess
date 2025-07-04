'use client'
import { motion } from "framer-motion";

export function ChessPieces() {
   const pieces = [
      { type: "king", delay: 0.2 },
      { type: "queen", delay: 0.3 },
      { type: "rook", delay: 0.4 },
      { type: "bishop", delay: 0.5 },
      { type: "knight", delay: 0.6 },
      { type: "pawn", delay: 0.7 },
   ];

   return (
      <div className="absolute inset-0 z-0 overflow-hidden">
         {pieces.map((piece, index) => (
            <ChessPiece
               key={index}
               type={piece.type as any}
               delay={piece.delay}
               index={index}
            />
         ))}
      </div>
   );
}

interface ChessPieceProps {
   type: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
   delay: number;
   index: number;
}

function ChessPiece({ type, delay, index }: ChessPieceProps) {
   const x = Math.random() * 100;
   const y = Math.random() * 100;

   const getSize = () => {
      switch (type) {
         case "king":
         case "queen":
            return "w-24 h-24";
         case "rook":
         case "bishop":
         case "knight":
            return "w-20 h-20";
         case "pawn":
            return "w-16 h-16";
         default:
            return "w-16 h-16";
      }
   };

   const floatAnimation = {
      y: [0, -10, 0],
      transition: {
         duration: 5 + Math.random() * 2,
         repeat: Infinity,
         ease: "easeInOut",
         delay: delay,
      },
   };

   return (
      <motion.div
         className={`absolute opacity-10 ${getSize()}`}
         style={{ top: `${y}%`, left: `${x}%` }}
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{
            opacity: 0.1,
            scale: 1,
            ...floatAnimation,
         }}
         transition={{
            duration: 0.8,
            delay: delay,
         }}
      >
         {renderPiece(type)}
      </motion.div>
   );
}

function renderPiece(type: string) {
   switch (type) {
      case "king":
         return (
            <svg
               viewBox="0 0 45 45"
               fill="currentColor"
               className="text-emerald-500"
            >
               <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
                  <path
                     d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
                     fill="currentColor"
                     strokeLinecap="butt"
                     strokeLinejoin="miter"
                  />
                  <path
                     d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7"
                     fill="currentColor"
                  />
                  <path d="M12.5 30c5.5-3 14.5-3 20 0M12.5 33.5c5.5-3 14.5-3 20 0M12.5 37c5.5-3 14.5-3 20 0" />
               </g>
            </svg>
         );
      case "queen":
         return (
            <svg
               viewBox="0 0 45 45"
               fill="currentColor"
               className="text-emerald-500"
            >
               <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path
                     d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"
                     fill="currentColor"
                  />
                  <path
                     d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1 2.5-1 2.5-1.5 1.5 0 2.5 0 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
                     fill="currentColor"
                  />
                  <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" />
               </g>
            </svg>
         );
      case "rook":
         return (
            <svg
               viewBox="0 0 45 45"
               fill="currentColor"
               className="text-emerald-500"
            >
               <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path
                     d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"
                     strokeLinecap="butt"
                  />
                  <path d="M34 14l-3 3H14l-3-3" />
                  <path
                     d="M31 17v12.5H14V17"
                     strokeLinecap="butt"
                     strokeLinejoin="miter"
                  />
                  <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
                  <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
               </g>
            </svg>
         );
      case "bishop":
         return (
            <svg
               viewBox="0 0 45 45"
               fill="currentColor"
               className="text-emerald-500"
            >
               <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <g fill="currentColor" strokeLinecap="butt">
                     <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
                     <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
                     <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
                  </g>
                  <path
                     d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"
                     strokeLinejoin="miter"
                  />
               </g>
            </svg>
         );
      case "knight":
         return (
            <svg
               viewBox="0 0 45 45"
               fill="currentColor"
               className="text-emerald-500"
            >
               <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               >
                  <path
                     d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
                     fill="currentColor"
                  />
                  <path
                     d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"
                     fill="currentColor"
                  />
                  <path
                     d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z"
                     fill="#000"
                     stroke="#000"
                  />
                  <path
                     d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"
                     fill="#000"
                     stroke="#000"
                     strokeWidth="1.49997"
                  />
               </g>
            </svg>
         );
      case "pawn":
         return (
            <svg
               viewBox="0 0 45 45"
               fill="currentColor"
               className="text-emerald-500"
            >
               <path
                  d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C16.83 16.5 15 18.59 15 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.83-4.5-4.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
               />
            </svg>
         );
      default:
         return null;
   }
}
