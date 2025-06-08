import { session } from "utils/types";
import { Room } from "./Room";
import { User } from "./User";
import { WebSocket } from "ws";

export class RoomManager {
   public rooms:Map<number, Room>;
   private static roomManagerInstance: RoomManager;
   

   private constructor() {
      this.rooms = new Map<number, Room>();
   }
   

   public static getInstance(): RoomManager {
      if (!this.roomManagerInstance) {
         this.roomManagerInstance = new RoomManager();
      }
      return this.roomManagerInstance;
   }

   public createRoom(id: number,user:session,ws:WebSocket): Room {
      const room = new Room(id);
      this.rooms.set(id, room);
      room.addUser(ws, user);
      return room;
   }

   public getRoom(id: number): Room | undefined {
      return this.rooms.get(id);
   }

   public joinRoom(id: number, user: session, ws: WebSocket): Room | undefined {
      const room = this.getRoom(id);
      if (room) {
         room.addUser(ws,user );
      }
      return room;
   }

}
