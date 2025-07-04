import WebSocket from "ws";
import { createRouter } from "./MediaSoupManager";
import { User } from "./User";
import * as mediasoup from "mediasoup";
import { session } from "utils/types";

export class Room {
   public id: number;
   public users: Map<WebSocket, User>;
   public router: mediasoup.types.Router | undefined;
   public prouducerTransports: Map<WebSocket, mediasoup.types.WebRtcTransport>;
   public consumerTransports: Map<WebSocket, mediasoup.types.WebRtcTransport>;
   public producersVideo: Map<WebSocket, mediasoup.types.Producer>;
   public consumersVideo: Map<WebSocket, mediasoup.types.Consumer>;
   public producersAudio: Map<WebSocket, mediasoup.types.Producer>;
   public consumersAudio: Map<WebSocket, mediasoup.types.Consumer>;

   public constructor(id: number) {
      this.id = id;
      this.users = new Map<WebSocket, User>();
      this.setup();
      this.prouducerTransports = new Map<WebSocket, mediasoup.types.WebRtcTransport>();
      this.consumerTransports = new Map<WebSocket, mediasoup.types.WebRtcTransport>();
      this.producersVideo = new Map<WebSocket, mediasoup.types.Producer>();
      this.consumersVideo = new Map<WebSocket, mediasoup.types.Consumer>();
      this.producersAudio = new Map<WebSocket, mediasoup.types.Producer>();
      this.consumersAudio = new Map<WebSocket, mediasoup.types.Consumer>();


   }

   private async setup() {
      this.router = await createRouter();
   }
   public addUser(socket: WebSocket, user: session): User {
      const newUser = new User(socket, user);
      this.users.set(socket, newUser);
      return newUser;
   }
}
