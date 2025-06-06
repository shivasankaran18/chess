import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { User } from "./User";
import { UserManager } from "./UserManager";
import { RoomManager } from "./RoomManager";
import {
   CONNECT_PRODUCER_TRANSPORT,
   CREATE_PRODUCER_TRANSPORT,
   INIT_SFU,
   NEW_PRODUCER,
   PRODUCE,
   PRODUCED,
   PRODUCER_GET_RTP_CAPABILITIES,
   PRODUCER_TRANSPORT_CONNECTED,
   PRODUCER_TRANSPORT_CREATED,
   PRODUCER_RTP_CAPABILITIES,
   CONSUMER_GET_RTP_CAPABILITIES,
   CONSUMER_RTP_CAPABILITIES,
   CREATE_CONSUMER_TRANSPORT,
   CONSUMER_TRANSPORT_CREATED,
} from "utils/constants";
import {
   createWebRtcTransport,
   getRouterRtpCapabilities,
} from "./MediaSoupManager";
import { Room } from "./Room";

const wss = new WebSocketServer({ port: 8000 });
const userManager = UserManager.getInstance();
const roomManager = RoomManager.getInstance();

wss.on("connection", (ws: WebSocket) => {
   ws.on("message", async (message) => {
      const data = JSON.parse(message.toString());
      const msg = data.type;
      let user: User | undefined;
      let room: Room | undefined;

      switch (msg) {
         case INIT_SFU:
            user = userManager.addUser(ws, data.user);
            if (!roomManager.rooms.has(parseInt(data.roomId))) {
               const room = roomManager.createRoom(data.roomId);
               room.users.set(ws, user);
            } else {
               roomManager.getRoom(data.roomId)?.users.set(ws, user);
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
            const consumerTransport = await createWebRtcTransport(
               room.router,
            );

            room.consumerTransports.set(ws,consumerTransport.transport);

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
         case PRODUCE:
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
               room.producers.set(ws, producer);
               console.log("Producer created successfully");
               ws.send(
                  JSON.stringify({
                     type: PRODUCED,
                     producerId: producer.id,
                  }),
               );

               room.users.forEach((user, socket) => {
                  if (socket !== ws) {
                     socket.send(
                        JSON.stringify({
                           type: NEW_PRODUCER,
                           producerId: producer.id,
                           userId: user.user.id,
                        }),
                     );
                  }
               });
            } catch (error) {
               console.error("Error producing:", error);
            }
      }
   });
});
