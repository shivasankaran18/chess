import { session } from "utils/types";
import { User } from "./User";
import { WebSocket } from "ws";


export class UserManagaer{
   private users:Map<WebSocket,User>;
   private static userManagerInstance: UserManagaer;

   private constructor() {
      this.users = new Map<WebSocket, User>();
   }
   public static getInstance(): UserManagaer {
      if (!this.userManagerInstance) {
         this.userManagerInstance = new UserManagaer();
      }
      return this.userManagerInstance;
   }

   public getUser(socket: WebSocket): User | undefined {
      return this.users.get(socket);
   }

   public  addUser(socket: WebSocket, user:session): User {
      if (this.users.has(socket)) {
         console.log(`User already exists: ${user.name}`);
         return this.users.get(socket)!;
      }
      const newUser = new User(socket, user);
      this.users.set(socket, newUser);
      console.log(`User added: ${newUser.user.name}`);
      return newUser;
   }

   public removeUser(socket: WebSocket): void {
      this.users.delete(socket);
   }

}


