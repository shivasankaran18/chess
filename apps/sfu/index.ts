import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { User } from "./User";
import { UserManager } from "./UserManager";
import { RoomManager } from "./RoomManager";
import { GET_RTP_CAPABILITIES, INIT_SFU, RTP_CAPABILITIES } from "utils/constants";
import { getRouterRtpCapabilities } from "./MediaSoupManager";

const wss = new WebSocketServer({ port: 8080 });
const userManager = UserManager.getInstance();
const roomManager = RoomManager.getInstance();

wss.on("connection", (ws: WebSocket) => {
   ws.on("message", (message) => {
      const data = JSON.parse(message.toString());
      const msg = data.type;
      let user: User | undefined;

      switch (msg) {
         case INIT_SFU:
            user = userManager.addUser(ws, data.user);
            if (roomManager.rooms.has(data.roomId)) {
               const room = roomManager.createRoom(data.roomId);
               room.users.add(user);
            } else {
               roomManager.getRoom(data.roomId)?.users.add(user);
            }
            ws.send(
               JSON.stringify({ type: "SFU initialized", roomId: data.roomId }),
            );

            break;

         case GET_RTP_CAPABILITIES:
            const rtpCapabilities = getRouterRtpCapabilities();
            ws.send(JSON.stringify({
               type: RTP_CAPABILITIES,
               capabilities: rtpCapabilities,

            }));

      }
   });
});
