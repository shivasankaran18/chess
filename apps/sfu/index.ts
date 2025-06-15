import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { User } from "./User";
import { RoomManager } from "./RoomManager";
import {
   CONNECT_PRODUCER_TRANSPORT,
   CREATE_PRODUCER_TRANSPORT,
   INIT_SFU,
   NEW_PRODUCER_VIDEO,
   PRODUCE_VIDEO,
   VIDEO_PRODUCED,
   PRODUCER_GET_RTP_CAPABILITIES,
   PRODUCER_TRANSPORT_CONNECTED,
   PRODUCER_TRANSPORT_CREATED,
   PRODUCER_RTP_CAPABILITIES,
   CONSUMER_GET_RTP_CAPABILITIES,
   CONSUMER_RTP_CAPABILITIES,
   CREATE_CONSUMER_TRANSPORT,
   CONSUMER_TRANSPORT_CREATED,
   CONNECT_CONSUMER_TRANSPORT,
   CONSUMER_TRANSPORT_CONNECTED,
   CONSUME_VIDEO,
   VIDEO_CONSUMED,
   PAUSE_PRODUCER_VIDEO,
   CONSUMER_PAUSED_VIDEO,
   PRODUCER_PAUSED_VIDEO,
   RESUME_PRODUCER_VIDEO,
   PRODUCER_RESUMED_VIDEO,
   CONSUMER_RESUMED_VIDEO,
   PRODUCE_AUDIO,
   AUDIO_PRODUCED,
   NEW_PRODUCER_AUDIO,
   CONSUME_AUDIO,
   AUDIO_CONSUMED,
   PAUSE_PRODUCER_AUDIO,
   PRODUCER_PAUSED_AUDIO,
   CONSUMER_PAUSED_AUDIO,
   PRODUCER_RESUMED_AUDIO,
   CONSUMER_RESUMED_AUDIO,
   RESUME_PRODUCER_AUDIO,
} from "utils/constants";
import {
   createWebRtcTransport,
   getRouterRtpCapabilities,
} from "./MediaSoupManager";
import { Room } from "./Room";

const wss = new WebSocketServer({ port: 8000 });
const roomManager = RoomManager.getInstance();

wss.on("connection", (ws: WebSocket) => {
   ws.on("message", async (message) => {
      const data = JSON.parse(message.toString());
      const msg = data.type;
      let user: User | undefined;
      let room: Room | undefined;
      console.log("Received message:", data);

      switch (msg) {
         case INIT_SFU:
            if (!roomManager.rooms.has(parseInt(data.roomId))) {
               const room = roomManager.createRoom(
                  parseInt(data.roomId),
                  data.user,
                  ws,
               );
            } else {
               roomManager.joinRoom(parseInt(data.roomId), data.user, ws);
            }
            ws.send(
               JSON.stringify({ type: "SFU initialized", roomId: data.roomId }),
            );
            console.log(roomManager.rooms);

            break;

         case PRODUCER_GET_RTP_CAPABILITIES:
            console.log("Received request for RTP capabilities");
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room || !room.router) {
               return;
            }
            console.log("Room found, getting RTP capabilities");
            const rtpCapabilities = getRouterRtpCapabilities(room.router);
            ws.send(
               JSON.stringify({
                  type: PRODUCER_RTP_CAPABILITIES,
                  capabilities: rtpCapabilities,
               }),
            );
            break;
         case CONSUMER_GET_RTP_CAPABILITIES:
            console.log("Received request for consumer RTP capabilities");
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room || !room.router) {
               return;
            }
            const consumerRtpCapabilities = getRouterRtpCapabilities(
               room.router,
            );
            ws.send(
               JSON.stringify({
                  type: CONSUMER_RTP_CAPABILITIES,
                  capabilities: consumerRtpCapabilities,
               }),
            );
            break;

         case CREATE_PRODUCER_TRANSPORT:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room?.router) {
               return;
            }
            const { params, transport } = await createWebRtcTransport(
               room?.router,
            );

            room.prouducerTransports.set(ws, transport);

            transport.observer.on("close", () => {
               console.log("❌ Producer transport closed");
            });

            ws.send(
               JSON.stringify({
                  type: PRODUCER_TRANSPORT_CREATED,
                  data: params,
               }),
            );
            break;
         case CREATE_CONSUMER_TRANSPORT:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room?.router) {
               return;
            }
            const consumerTransport = await createWebRtcTransport(room.router);

            room.consumerTransports.set(ws, consumerTransport.transport);

            consumerTransport.transport.observer.on("close", () => {
               console.log("❌ Consumer transport closed");
            });

            ws.send(
               JSON.stringify({
                  type: CONSUMER_TRANSPORT_CREATED,
                  data: consumerTransport.params,
               }),
            );
            break;

         case CONNECT_PRODUCER_TRANSPORT:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               return;
            }
            const producerTransport = room.prouducerTransports.get(ws);
            if (!producerTransport) {
               return;
            }
            try {
               await producerTransport.connect({
                  dtlsParameters: data.dtlsParameters,
               });
               ws.send(
                  JSON.stringify({
                     type: PRODUCER_TRANSPORT_CONNECTED,
                  }),
               );
            } catch (error) {
               console.error("Error connecting producer transport:", error);
            }
            break;
         case CONNECT_CONSUMER_TRANSPORT:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               return;
            }
            const consTrans = room.consumerTransports.get(ws);
            if (!consTrans) {
               return;
            }
            try {
               await consTrans.connect({
                  dtlsParameters: data.dtlsParameters,
               });
               ws.send(
                  JSON.stringify({
                     type: CONSUMER_TRANSPORT_CONNECTED,
                  }),
               );
            } catch (error) {
               console.error("Error connecting consumer transport:", error);
            }
            break;

         case PRODUCE_VIDEO:
            const { kind, rtpParameters } = data;
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               return;
            }
            const producerTrans = room.prouducerTransports.get(ws);
            if (producerTrans == null) {
               return;
            }
            try {
               const producer = await producerTrans.produce({
                  kind,
                  rtpParameters,
               });
               room.producersVideo.set(ws, producer);
               console.log("Producer created successfully");
               ws.send(
                  JSON.stringify({
                     type: VIDEO_PRODUCED,
                     producerId: producer.id,
                  }),
               );
               console.log(room.users.size, "users in the room");
               room.users.forEach((user, socket) => {
                  console.log(
                     "Sending new producer notification to all users in the room",
                  );
                  if (socket !== ws) {
                     socket.send(
                        JSON.stringify({
                           type: NEW_PRODUCER_VIDEO,
                           producerId: producer.id,
                           userId: user.user.id,
                        }),
                     );
                  }
               });
            } catch (error) {
               console.error("Error producing:", error);
            }
            break;

         case CONSUME_VIDEO:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for consumer request");
               return;
            }
            const cTransport = room.consumerTransports.get(ws);
            if (!cTransport) {
               console.error(
                  "Consumer transport not found for consumer request",
               );
               return;
            }
            let producer;
            for (const [socket, p] of room.producersVideo.entries()) {
               if (socket !== ws) {
                  producer = p;
                  break;
               }
            }

            if (!producer) {
               console.log("Producer not found for consumer request");
               return;
            }
            if (
               !room.router?.canConsume({
                  producerId: producer.id,
                  rtpCapabilities: data.rtpCapabilities,
               })
            ) {
               console.error(
                  "Cannot consume from this producer with the given RTP capabilities",
               );
               ws.send(
                  JSON.stringify({
                     type: "error",
                     message:
                        "Cannot consume from this producer with the given RTP capabilities",
                  }),
               );
               return;
            }
            try {
               console.log("Consuming producer:", producer.id);
               const consumer = await cTransport.consume({
                  producerId: producer.id,
                  rtpCapabilities: data.rtpCapabilities,
                  paused: false,
               });
               room.consumersVideo.set(ws, consumer);
               console.log("Consumer created successfully");
               ws.send(
                  JSON.stringify({
                     type: VIDEO_CONSUMED,
                     consumerId: consumer.id,
                     producerId: producer.id,
                     kind: consumer.kind,
                     rtpParameters: consumer.rtpParameters,
                  }),
               );
            } catch (error) {
               console.error("Error consuming:", error);
            }
            break;

         case PAUSE_PRODUCER_VIDEO:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for pause request");
               return;
            }
            room.producersVideo.forEach((producer, socket) => {
               if (socket === ws) {
                  producer.pause();
                  console.log("Producer paused successfully");
                  socket.send(
                     JSON.stringify({
                        type: PRODUCER_PAUSED_VIDEO,
                        producerId: producer.id,
                     }),
                  );
               }
            });
            room.users.forEach((user, socket) => {
               if (socket !== ws) {
                  socket.send(
                     JSON.stringify({
                        type: CONSUMER_PAUSED_VIDEO,
                        producerId: data.producerId,
                        userId: user.user.id,
                     }),
                  );
               }
            });
            break;

         case RESUME_PRODUCER_VIDEO:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for resume request");
               return;
            }
            room.producersVideo.forEach((producer, socket) => {
               if (socket === ws) {
                  producer.resume();
                  console.log("Producer resumed successfully");
                  socket.send(
                     JSON.stringify({
                        type: PRODUCER_RESUMED_VIDEO,
                        producerId: producer.id,
                     }),
                  );
               }
            });
            room.users.forEach((user, socket) => {
               if (socket !== ws) {
                  socket.send(
                     JSON.stringify({
                        type: CONSUMER_RESUMED_VIDEO,
                        producerId: data.producerId,
                        userId: user.user.id,
                     }),
                  );
               }
            });
            break;
         case PRODUCE_AUDIO:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for audio production");
               return;
            }
            const audioProducerTrans = room.prouducerTransports.get(ws);
            if (audioProducerTrans == null) {
               console.error(
                  "Producer transport not found for audio production",
               );
               return;
            }
            try {
               const audioProducer = await audioProducerTrans.produce({
                  kind: "audio",
                  rtpParameters: data.rtpParameters,
               });
               room.producersAudio.set(ws, audioProducer);
               console.log("Audio producer created successfully");
               ws.send(
                  JSON.stringify({
                     type: AUDIO_PRODUCED,
                     producerId: audioProducer.id,
                  }),
               );
               room.users.forEach((user, socket) => {
                  if (socket !== ws) {
                     socket.send(
                        JSON.stringify({
                           type: NEW_PRODUCER_AUDIO,
                           producerId: audioProducer.id,
                           userId: user.user.id,
                        }),
                     );
                  }
               });
            } catch (error) {
               console.error("Error producing audio:", error);
            }

         case CONSUME_AUDIO:
            room= roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for audio consumption");
               return;
            }
            const audioTransport = room.consumerTransports.get(ws);
            if (!audioTransport) {
               console.error(
                  "Consumer transport not found for audio consumption",
               );
               return;
            }
            let audioProducer;
            for (const [socket, p] of room.producersAudio.entries()) {
               if (socket !== ws) {
                  audioProducer = p;
                  break;
               }
            }
            if (!audioProducer) {
               console.log("Audio producer not found for consumer request");
               return;
            }
            if (
               !room.router?.canConsume({
                  producerId: audioProducer.id,
                  rtpCapabilities: data.rtpCapabilities,
               })
            ) {
               console.error(
                  "Cannot consume from this audio producer with the given RTP capabilities",
               );
               ws.send(
                  JSON.stringify({
                     type: "error",
                     message:
                        "Cannot consume from this audio producer with the given RTP capabilities",
                  }),
               );
               return;
            }
            try {
               console.log("Consuming audio producer:", audioProducer.id);
               const audioConsumer = await audioTransport.consume({
                  producerId: audioProducer.id,
                  rtpCapabilities: data.rtpCapabilities,
                  paused: false,
               });
               room.consumersAudio.set(ws, audioConsumer);
               console.log("Audio consumer created successfully");
               ws.send(
                  JSON.stringify({
                     type: AUDIO_CONSUMED,
                     consumerId: audioConsumer.id,
                     producerId: audioProducer.id,
                     kind: audioConsumer.kind,
                     rtpParameters: audioConsumer.rtpParameters,
                  }),
               );
            } catch (error) {
               console.error("Error consuming audio:", error);
            }
            break;
         case PAUSE_PRODUCER_AUDIO:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for audio pause request");
               return;
            }
            room.producersAudio.forEach((producer, socket) => {
               if (socket === ws) {
                  producer.pause();
                  console.log("Audio producer paused successfully");
                  socket.send(
                     JSON.stringify({
                        type: PRODUCER_PAUSED_AUDIO,
                        producerId: producer.id,
                     }),
                  );
               }
            });
            room.users.forEach((user, socket) => {
               if (socket !== ws) {
                  socket.send(
                     JSON.stringify({
                        type: CONSUMER_PAUSED_AUDIO,
                        producerId: data.producerId,
                        userId: user.user.id,
                     }),
                  );
               }
            });
            break;
         case RESUME_PRODUCER_AUDIO:
            room = roomManager.getRoom(parseInt(data.roomId));
            if (!room) {
               console.error("Room not found for audio resume request");
               return;
            }
            room.producersAudio.forEach((producer, socket) => {
               if (socket === ws) {
                  producer.resume();
                  console.log("Audio producer resumed successfully");
                  socket.send(
                     JSON.stringify({
                        type: PRODUCER_RESUMED_AUDIO,
                        producerId: producer.id,
                     }),
                  );
               }
            });
            room.users.forEach((user, socket) => {
               if (socket !== ws) {
                  socket.send(
                     JSON.stringify({
                        type: CONSUMER_RESUMED_AUDIO,
                        producerId: data.producerId,
                        userId: user.user.id,
                     }),
                  );
               }
            });
            break;

         default:
            console.error("Unknown message type:", msg);
            ws.send(
               JSON.stringify({
                  type: "error",
                  message: "Unknown message type",
               }),
            );
            break;
      }
   });
});




