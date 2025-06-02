import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, User } from "lucide-react";
import { session } from "utils/types";
import { Message } from "utils/types";
import { GAME_MSG } from "utils/constants";

type ChatComponentProps = {
   gameId: number;
   socket: WebSocket | null;
   messages: Message[];
   user: session;
};

export default function ChatComponent({
   gameId,
   socket,
   messages,
   user,
}: ChatComponentProps) {
   const [newMessage, setNewMessage] = useState("");
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };

   useEffect(() => {
      scrollToBottom();
   }, [messages]);

   const sendMessage = () => {
      if (!newMessage.trim() || !socket) return;

      const messageToSend = {
         message: newMessage.trim(),
         gameId,
         type: GAME_MSG,
      };
      socket.send(JSON.stringify(messageToSend));
   };

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
         setNewMessage("");
      }
   };

   const formatTime = (timestamp: string) => {
      return new Date(timestamp).toLocaleTimeString([], {
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   return (
      <div className="flex flex-col h-full">
         <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-900/30">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-emerald-400 font-medium">Game Chat</h3>
            <div className="ml-auto">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
         </div>

         <div className="flex-grow overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-emerald-900/50 scrollbar-track-transparent">
            <AnimatePresence>
               {messages.map((message, index) => {
                  const isOwn = message.name === user.name;

                  return (
                     <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                     >
                        <div
                           className={`max-w-[80%] ${isOwn ? "order-2" : "order-1"}`}
                        >
                           <div
                              className={`rounded-lg px-3 py-2 ${
                                 isOwn
                                    ? "bg-emerald-600/20 text-emerald-100 border border-emerald-500/30"
                                    : "bg-gray-800/50 text-gray-200 border border-gray-700/50"
                              }`}
                           >
                              <p className="text-sm break-words">
                                 {message.text}
                              </p>
                           </div>
                           <div
                              className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                 isOwn ? "justify-end" : "justify-start"
                              }`}
                           >
                              <User className="w-3 h-3" />
                              <span>{message.name}</span>
                              <span>•</span>
                              <span>
                                 {formatTime(new Date(message.timestamp).toISOString())}
                              </span>
                           </div>
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
         </div>

         <div className="flex gap-2">
            <div className="flex-grow relative">
               <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                  rows={1}
                  style={{ minHeight: "38px", maxHeight: "100px" }}
               />
            </div>
            <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={sendMessage}
               disabled={!newMessage.trim()}
               className="bg-emerald-600/20 hover:bg-emerald-600/30 disabled:bg-gray-800/30 disabled:text-gray-600 text-emerald-400 border border-emerald-500/30 disabled:border-gray-700/30 rounded-lg px-3 py-2 transition-colors"
            >
               <Send className="w-4 h-4" />
            </motion.button>
         </div>

         <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-emerald-900/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">2 players online</span>
         </div>
      </div>
   );
}
