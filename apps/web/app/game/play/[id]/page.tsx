"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import ChessBoard from "@/components/ChessBoard";
import MovesList from "@/components/MovesList";
import PlayerTimer from "@/components/PlayerTimer";
import WaitingRoom from "@/components/WaitingRoom";
import ChatComponent from "@/components/ChatComponent";
import { SFU_URL, WS_URL } from "@/config";
import {
   GAME_JOIN,
   INIT_GAME,
   GAME_CREATED,
   GAME_STARTED,
   GAME_MOVE,
   GAME_OVER,
   GAME_MSG,
   INIT_SFU,
   PRODUCER_RTP_CAPABILITIES,
   PRODUCER_TRANSPORT_CREATED,
   PRODUCER_TRANSPORT_CONNECTED,
   VIDEO_PRODUCED,
   NEW_PRODUCER_VIDEO,
   CONSUMER_RTP_CAPABILITIES,
   CONSUMER_TRANSPORT_CREATED,
   CONSUMER_TRANSPORT_CONNECTED,
   VIDEO_CONSUMED,
   RESUME_PRODUCER_VIDEO,
   PRODUCER_PAUSED_VIDEO,
   CONSUMER_PAUSED_VIDEO,
   PAUSE_PRODUCER_VIDEO,
   PRODUCER_RESUMED_VIDEO,
   CONSUMER_RESUMED_VIDEO,
   NEW_PRODUCER_AUDIO,
   AUDIO_CONSUMED,
   RESUME_PRODUCER_AUDIO,
   PAUSE_PRODUCER_AUDIO,
} from "utils/constants";
import { useSession } from "next-auth/react";
import { Chess } from "chess.js";
import { useParams, useRouter } from "next/navigation";
import type { Message, Moves } from "utils/types";
import {
   consume,
   createReceiveTransport,
   createSendTransport,
   getConsumerRtpCapabilities,
   getProducerRtpCapabilities,
   loadDevice,
   requestConsumerTransport,
   requestProducerTransport,
} from "@/lib/sfuHelper";
import type * as mediasoupClient from "mediasoup-client";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
export default function GamePage() {
   const { theme } = useTheme();

   const [gameStarted, setGameStarted] = useState(false);
   const [gameLink, setGameLink] = useState(
      "https://chessmaster.com/game/a1b2c3d4",
   );
   const [copied, setCopied] = useState(false);
   const socketRef = useRef<WebSocket | null>(null);
   const [chess, setChess] = useState(new Chess());
   const [board, setBoard] = useState(chess.board());
   const [loading, setLoading] = useState(true);
   const [id, setId] = useState<number>(0);
   const [moves, setMoves] = useState<Moves>([]);
   const [messages, setMessages] = useState<Message[]>([]);

   const sfuRef = useRef<WebSocket | null>(null);
   const deviceRef = useRef<mediasoupClient.Device | null>(null);
   const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(
      null,
   );
   const localVideoRef = useRef<HTMLVideoElement | null>(null);
   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
   const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
   const receiveTransportRef = useRef<mediasoupClient.types.Transport | null>(
      null,
   );
   const producerIdRef = useRef<string | null>(null);
   const localStreamRef = useRef<MediaStream | null>(null);
   const remoteStreamRef = useRef<MediaStream | null>(null);
   const localAudioStreamRef = useRef<MediaStream | null>(null);
   const remoteAudioStreamRef = useRef<MediaStream | null>(null);

   const [isVideoEnabled, setIsVideoEnabled] = useState(false);
   const [isAudioEnabled, setIsAudioEnabled] = useState(false);
   const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
   const [hasRemoteAudio, setHasRemoteAudio] = useState(false);
   const [firstTimeVideo, setFirstTimeVideo] = useState(true);
   const [firstTimeAudio, setFirstTimeAudio] = useState(true);

   const [showVideoConsumeDialog, setShowVideoConsumeDialog] = useState(false);
   const [showAudioConsumeDialog, setShowAudioConsumeDialog] = useState(false);

   const videoCallback = useRef<((data: { id: string }) => void) | null>(null);
   const audioCallback = useRef(null);

   const { data: session, status } = useSession();
   const router = useRouter();
   const params = useParams();
   const gameId = params?.id?.toString();
   //
   // useEffect(() => {
   //   if (gameStarted) {
   //     // Test video dialog after 5 seconds
   //     const videoTimer = setTimeout(() => {
   //       setShowVideoConsumeDialog(true)
   //     }, 5000)
   //
   //     // Test audio dialog after 10 seconds
   //     const audioTimer = setTimeout(() => {
   //       setShowAudioConsumeDialog(true)
   //     }, 10000)
   //
   //     return () => {
   //       clearTimeout(videoTimer)
   //       clearTimeout(audioTimer)
   //     }
   //   }
   // }, [gameStarted])

   const handleToggleVideo = async () => {
      if (!isVideoEnabled) {
         try {
            setIsVideoEnabled(true);
            if (firstTimeVideo) {
               getProducerRtpCapabilities(sfuRef, id);
               setFirstTimeVideo(false);
            } else {
               sfuRef.current?.send(
                  JSON.stringify({
                     type: RESUME_PRODUCER_VIDEO,
                     roomId: id,
                  }),
               );
            }
         } catch (error) {
            console.error("Error accessing video:", error);
         }
      } else {
         sfuRef.current?.send(
            JSON.stringify({
               type: PAUSE_PRODUCER_VIDEO,
               roomId: id,
            }),
         );
      }
   };

   const handleToggleAudio = async () => {
      console.log("Toggle audio", isAudioEnabled);
      if (!isAudioEnabled) {
         try {
            console.log("Enabling audio");
            if (firstTimeAudio) {
               let stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
               });
               sendTransportRef.current?.produce({
                  track: stream.getAudioTracks()[0],
               });
               localAudioStreamRef.current = stream;
               setIsAudioEnabled(true);
               setFirstTimeAudio(false);
            }
            else
            {
               sfuRef.current?.send(
                  JSON.stringify({
                     type: RESUME_PRODUCER_AUDIO,
                     roomId: id,
                  }),
               );
               setIsAudioEnabled(true);

            }
         } catch (error) {
            console.error("Error accessing audio:", error);
         }
      } else {
         sfuRef.current?.send(JSON.stringify({
            type: PAUSE_PRODUCER_AUDIO,
            roomId: id,
         }))
         setIsAudioEnabled(false);
      }
   };

   const handleConfirmVideoConsume = () => {
      setShowVideoConsumeDialog(false);
      setHasRemoteVideo(true);

      consume(sfuRef, deviceRef, id, producerIdRef, "video");
   };

   const handleDeclineVideoConsume = () => {
      setShowVideoConsumeDialog(false);
   };

   const handleConfirmAudioConsume = () => {
      setShowAudioConsumeDialog(false);
      setHasRemoteAudio(true);
      consume(sfuRef, deviceRef, id, producerIdRef, "audio");
   };

   const handleDeclineAudioConsume = () => {
      setShowAudioConsumeDialog(false);
   };

   useEffect(() => {
      if (status === "loading") return;

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
         socketRef.current = ws;

         if (gameId !== "new") {
            ws.send(
               JSON.stringify({
                  type: GAME_JOIN,
                  gameId,
                  user: session?.user,
                  status,
               }),
            );
         } else {
            ws.send(
               JSON.stringify({
                  type: INIT_GAME,
                  gameId,
                  user: session?.user,
               }),
            );
         }
      };

      ws.onmessage = (event) => {
         const data = JSON.parse(event.data);
         const msg = data.type;

         switch (msg) {
            case GAME_CREATED:
               setLoading(false);
               break;

            case GAME_STARTED:
               setId(data.gameId);
               setGameStarted(true);
               setLoading(false);
               break;

            case GAME_MOVE:
               chess.move(data.move);
               setBoard(chess.board());
               setMoves(data.moves);
               break;

            case GAME_OVER:
               setGameStarted(false);
               alert(`Game Over! ${data.winner} wins!`);
               setChess(new Chess());
               setBoard(new Chess().board());
               router.push("/home");
               break;

            case GAME_MSG:
               setMessages(data.messages);
               break;

            default:
               console.log("Unhandled message type:", msg);
         }
      };

      return () => {
         ws.close();
      };
   }, [status]);

   useEffect(() => {
      if (status === "loading" || !socketRef.current || !id) {
         return;
      }
      const ws = new WebSocket(SFU_URL);

      ws.onopen = () => {
         sfuRef.current = ws;

         ws.send(
            JSON.stringify({
               type: INIT_SFU,
               roomId: id,
               user: session?.user,
            }),
         );
      };

      ws.onmessage = async (event) => {
         const msg = JSON.parse(event.data);
         console.log(msg);
         console.log(remoteVideoRef.current);
         switch (msg.type) {
            case PRODUCER_RTP_CAPABILITIES:
               await loadDevice(deviceRef, msg.capabilities, id);
               requestProducerTransport(
                  sfuRef,
                  deviceRef.current?.rtpCapabilities,
                  id,
               );
               break;
            case PRODUCER_TRANSPORT_CREATED:
               if (!sfuRef.current || !deviceRef.current) {
                  return;
               }
               createSendTransport(
                  msg.data,
                  sfuRef,
                  deviceRef,
                  sendTransportRef,
                  id,
                  localVideoRef,
                  localStreamRef,
                  videoCallback,
                  audioCallback,
               );
               break;
            case PRODUCER_TRANSPORT_CONNECTED:
               break;

            case VIDEO_PRODUCED:
               if (!videoCallback || !videoCallback.current) {
                  return;
               }
               videoCallback.current({ id: msg.producerId });
               break;

            case NEW_PRODUCER_VIDEO:
               producerIdRef.current = msg.producerId;
               getConsumerRtpCapabilities(sfuRef, id);
               break;

            case CONSUMER_RTP_CAPABILITIES:
               await loadDevice(deviceRef, msg.capabilities, id);
               requestConsumerTransport(
                  sfuRef,
                  deviceRef.current?.rtpCapabilities,
                  id,
               );
               break;

            case CONSUMER_TRANSPORT_CREATED:
               if (!sfuRef.current || !deviceRef.current) {
                  return;
               }
               createReceiveTransport(
                  msg.data,
                  sfuRef,
                  deviceRef,
                  receiveTransportRef,
                  id,
                  remoteVideoRef,
                  producerIdRef.current,
                  setShowVideoConsumeDialog,
               );
               break;
            case CONSUMER_TRANSPORT_CONNECTED:
               console.log("Consumer transport connected");
               break;

            case VIDEO_CONSUMED:
               if (
                  !remoteVideoRef ||
                  !remoteVideoRef.current ||
                  !receiveTransportRef ||
                  !receiveTransportRef.current
               ) {
                  console.error("Remote video element not found");
                  return;
               }
               const consumer = await receiveTransportRef?.current?.consume({
                  id: msg.consumerId,
                  producerId: msg.producerId,
                  kind: msg.kind,
                  rtpParameters: msg.rtpParameters,
               });
               const stream = new MediaStream();
               stream.addTrack(consumer.track);
               remoteStreamRef.current = stream;

               if (msg.kind === "video") {
                  remoteVideoRef.current.srcObject = stream;
                  setHasRemoteVideo(true);
               }
               console.log(remoteVideoRef.current);

               console.log("🎥 Stream consumed");
               break;

            case PRODUCER_PAUSED_VIDEO:
               if (!localVideoRef || !localVideoRef.current) {
                  return;
               }
               localVideoRef.current.srcObject = null;
               setIsVideoEnabled(false);
               break;

            case CONSUMER_PAUSED_VIDEO:
               if (remoteVideoRef.current?.srcObject) {
                  remoteVideoRef.current.srcObject = null;
               }

               break;
            case PRODUCER_RESUMED_VIDEO:
               if (localVideoRef.current) {
                  localVideoRef.current.srcObject = localStreamRef.current;
                  setIsVideoEnabled(true);
               }

               break;
            case CONSUMER_RESUMED_VIDEO:
               if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStreamRef.current;
               }
               setHasRemoteVideo(true);
               break;
            case NEW_PRODUCER_AUDIO:
               setShowAudioConsumeDialog(true);

            case AUDIO_CONSUMED:
               if (
                  !remoteVideoRef ||
                  !remoteVideoRef.current ||
                  !receiveTransportRef ||
                  !receiveTransportRef.current ||
                  !remoteAudioRef ||
                  !remoteAudioRef.current
               ) {
                  console.error("Remote audio element not found");
                  return;
               }
               const audioConsumer =
                  await receiveTransportRef?.current?.consume({
                     id: msg.consumerId,
                     producerId: msg.producerId,
                     kind: msg.kind,
                     rtpParameters: msg.rtpParameters,
                  });
               const audioStream = new MediaStream();
               audioStream.addTrack(audioConsumer.track);
               remoteAudioStreamRef.current = audioStream;
               remoteAudioRef.current.srcObject = audioStream;

               if (msg.kind === "audio") {
                  setHasRemoteAudio(true);
               }
               break;
            case 'CONSUMER_PAUSED_AUDIO':
               if (remoteAudioRef.current?.srcObject) {
                  remoteAudioRef.current.srcObject = null;
               }
               break;

            case 'CONSUMER_RESUMED_AUDIO':
               if (remoteAudioRef.current) {
                  remoteAudioRef.current.srcObject = remoteAudioStreamRef.current;
               }
               break;

               
         }
      };

      return () => {
         ws.close();
      };
   }, [status, socketRef, id]);

   const copyGameLink = () => {
      navigator.clipboard.writeText(gameLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
            <div className="text-lg font-semibold">Loading...</div>
         </div>
      );
   }

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="min-h-screen bg-[#111111] text-white flex flex-col relative overflow-x-hidden"
      >
         <header className="p-4 border-b border-emerald-900/30">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
               <Link href="/" className="flex items-center gap-2">
                  <motion.div
                     className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"
                     whileHover={{ scale: 1.05 }}
                  >
                     <span className="text-black font-bold text-xl">♞</span>
                  </motion.div>
                  <span className="text-xl font-bold text-emerald-500">
                     ChessMaster
                  </span>
               </Link>

               <div className="flex items-center gap-4">
                  <Link
                     href="/home"
                     className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                     <ArrowLeft size={16} />
                     <span>Exit Game</span>
                  </Link>
               </div>
            </div>
         </header>

         <AnimatePresence>
            {hasRemoteVideo && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
                  className="fixed top-20 left-4 z-50 w-40 h-28 md:w-48 md:h-36 bg-black rounded-lg overflow-hidden border-2 border-emerald-500/50 shadow-2xl"
               >
                  <video
                     ref={remoteVideoRef}
                     autoPlay
                     playsInline
                     muted
                     className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black/70 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs text-white">
                     Player 2
                  </div>
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-emerald-500/20 px-1 py-0.5 md:px-2 md:py-1 rounded text-xs text-emerald-400">
                     Video
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <main className="flex-grow p-4 md:p-8 flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto w-full relative">
            <div
               className="flex-grow flex flex-col gap-6"
               style={{
                  paddingLeft: hasRemoteVideo || hasRemoteAudio ? "260px" : "0",
               }}
            >
               <motion.div
                  className="flex items-center justify-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
               >
                  <div className="w-full max-w-2xl mx-auto">
                     <ChessBoard
                        board={board}
                        setBoard={setBoard}
                        chess={chess}
                        setChess={setChess}
                        socket={socketRef.current}
                        gameId={id}
                     />
                  </div>
               </motion.div>

               {gameStarted && (
                  <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.7, duration: 0.5 }}
                     className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4 max-w-2xl mx-auto w-full"
                  >
                     <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-emerald-400 font-medium">
                           Game Moves
                        </h3>
                     </div>
                     <MovesList moves={moves} />
                  </motion.div>
               )}
            </div>

            <motion.div
               className="xl:w-80 w-full"
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
            >
               <div className="h-full flex flex-col gap-4">
                  <motion.div
                     initial={{ y: -10, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4"
                  >
                     <PlayerTimer
                        playerName="Player 1"
                        timeLeft={600}
                        isActive={gameStarted}
                        isCurrentPlayer={true}
                     />
                  </motion.div>

                  <div className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4 flex-grow flex flex-col min-h-[400px]">
                     {!gameStarted ? (
                        <WaitingRoom
                           gameLink={gameLink}
                           onCopy={copyGameLink}
                           copied={copied}
                        />
                     ) : (
                        <ChatComponent
                           gameId={id}
                           socket={socketRef.current}
                           messages={messages}
                           user={session?.user}
                        />
                     )}
                  </div>

                  <motion.div
                     initial={{ y: 10, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="bg-[#0a0a0a] border border-emerald-900/30 rounded-lg p-4"
                  >
                     <PlayerTimer
                        playerName="Player 2"
                        timeLeft={600}
                        isActive={gameStarted}
                        isCurrentPlayer={false}
                     />
                  </motion.div>

                  <motion.button
                     whileHover={{ scale: 1.03 }}
                     whileTap={{ scale: 0.97 }}
                     className="w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg font-medium transition-colors mt-2"
                  >
                     Resign Game
                  </motion.button>
               </div>
               <button
                  className="bg-green-700 w-screen"
                  onClick={() => consume(sfuRef, deviceRef, id, producerIdRef)}
               >
                  consume
               </button>
            </motion.div>
         </main>

         <AnimatePresence>
            {isVideoEnabled && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
                  className="fixed bottom-24 right-4 z-50 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-emerald-500/50 shadow-2xl"
               >
                  <video
                     ref={localVideoRef}
                     autoPlay
                     playsInline
                     muted
                     className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                     You
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="fixed bottom-4 right-4 z-40 flex gap-3">
            <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={handleToggleVideo}
               className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                  isVideoEnabled
                     ? "bg-emerald-500 text-white"
                     : "bg-gray-700 text-gray-300"
               }`}
            >
               {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </motion.button>

            <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={handleToggleAudio}
               className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                  isAudioEnabled
                     ? "bg-emerald-500 text-white"
                     : "bg-gray-700 text-gray-300"
               }`}
            >
               {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </motion.button>
         </div>

         <AnimatePresence>
            {hasRemoteAudio && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
                  className={`fixed left-4 z-50 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3 shadow-2xl ${
                     hasRemoteVideo ? "top-52 md:top-64" : "top-20"
                  }`}
               >
                  <motion.div
                     animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7],
                     }}
                     transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        ease: "easeInOut",
                     }}
                     className="flex items-center justify-center"
                  >
                     <Volume2
                        size={16}
                        className="text-emerald-400 md:w-5 md:h-5"
                     />
                  </motion.div>
                  <div className="flex flex-col">
                     <span className="text-emerald-400 text-xs md:text-sm font-medium">
                        Player 2
                     </span>
                     <span className="text-emerald-300 text-xs">Audio</span>
                  </div>

                  <motion.div
                     animate={{ height: [4, 12, 8, 16, 6, 14, 4] }}
                     transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 0.8,
                        ease: "easeInOut",
                     }}
                     className="w-1 bg-emerald-400 rounded-full"
                  />
               </motion.div>
            )}
         </AnimatePresence>
         <audio ref={remoteAudioRef} autoPlay style={{ display: "none" }} />

         <Dialog
            open={showVideoConsumeDialog}
            onOpenChange={setShowVideoConsumeDialog}
         >
            <DialogContent className="bg-[#0a0a0a] border border-emerald-900/30 text-white">
               <DialogHeader>
                  <DialogTitle className="text-emerald-400 flex items-center gap-2">
                     <Video size={20} />
                     Video Call Request
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                     Player 2 wants to share their video with you. Do you want
                     to accept and view their video stream?
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className="gap-2">
                  <Button
                     variant="outline"
                     onClick={handleDeclineVideoConsume}
                     className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                     Decline
                  </Button>
                  <Button
                     onClick={handleConfirmVideoConsume}
                     className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                     Accept Video
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <Dialog
            open={showAudioConsumeDialog}
            onOpenChange={setShowAudioConsumeDialog}
         >
            <DialogContent className="bg-[#0a0a0a] border border-emerald-900/30 text-white">
               <DialogHeader>
                  <DialogTitle className="text-emerald-400 flex items-center gap-2">
                     <Mic size={20} />
                     Audio Call Request
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                     Player 2 wants to share their audio with you. Do you want
                     to accept and hear their audio stream?
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className="gap-2">
                  <Button
                     variant="outline"
                     onClick={handleDeclineAudioConsume}
                     className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                     Decline
                  </Button>
                  <Button
                     onClick={handleConfirmAudioConsume}
                     className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                     Accept Audio
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </motion.div>
   );
}
