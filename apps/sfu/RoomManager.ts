import { Room } from "./Room";

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

   public createRoom(id: number): Room {
      const room = new Room(id);
      this.rooms.set(id, room);
      return room;
   }

   public getRoom(id: number): Room | undefined {
      return this.rooms.get(id);
   }
}
