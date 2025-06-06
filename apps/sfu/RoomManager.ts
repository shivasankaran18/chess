import { Room } from "./Room";

export class RoomManager {
   public rooms:Set<Room>;
   private static roomManagerInstance: RoomManager;
   

   private constructor() {
      this.rooms = new Set<Room>();
   }
   

   public static getInstance(): RoomManager {
      if (!this.roomManagerInstance) {
         this.roomManagerInstance = new RoomManager();
      }
      return this.roomManagerInstance;
   }

   public createRoom(id: number): Room {
      const room = new Room(id);
      this.rooms.add(room);
      return room;
   }

   public getRoom(id: number): Room | undefined {
      return Array.from(this.rooms).find(room => room.id === id);
   }
}
