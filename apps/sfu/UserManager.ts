import { WebSocket } from "ws";
import { User } from "./User";

export class UserManager{
   private users:Map<WebSocket, User>;
   private static userManagerInstance: UserManager;

   private constructor() {
      this.users = new Map<WebSocket, User>();
   }
   public static getInstance(): UserManager {
      if (!this.userManagerInstance) {
         this.userManagerInstance = new UserManager();
      }
      return this.userManagerInstance;
   }

   public addUser(socket: WebSocket, user: any): User {
      const newUser = new User(socket, user);
      this.users.set(socket, newUser);
      return newUser;
   }



}
