import {session} from "utils/types"
import { WebSocket } from "ws";

export class User{
   public socket: WebSocket;
   public user: session;

   public constructor(socket: WebSocket, user: session) {
      this.socket = socket;
      this.user = user;
   }
}

