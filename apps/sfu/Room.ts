import WebSocket from "ws";
import { createRouter } from "./MediaSoupManager";
import { User } from "./User";
import * as mediasoup from "mediasoup";

export class Room {
   public id: number;
   public users: Map<WebSocket, User>;
   public router: mediasoup.types.Router | undefined;
   public prouducerTransports: Map<WebSocket, mediasoup.types.WebRtcTransport>;
   public consumerTransports: Map<WebSocket, mediasoup.types.WebRtcTransport>;
   public producers: Map<string, mediasoup.types.Producer>;
   public consumers: Map<string, mediasoup.types.Consumer>;

   public constructor(id: number) {
      this.id = id;
      this.users = new Map<WebSocket, User>();
      this.setup();
      this.prouducerTransports = new Map<WebSocket, mediasoup.types.WebRtcTransport>();
      this.consumerTransports = new Map<WebSocket, mediasoup.types.WebRtcTransport>();
      this.producers = new Map<string, mediasoup.types.Producer>();
      this.consumers = new Map<string, mediasoup.types.Consumer>();
   }

   private async setup() {
      this.router = await createRouter();
   }
   public addUser(socket: WebSocket, user: any): User {
      const newUser = new User(socket, user);
      this.users.set(socket, newUser);
      return newUser;
   }
}
