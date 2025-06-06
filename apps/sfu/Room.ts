import { User } from "./User";

export class Room{
   public id:number;
   public users:Set<User>;

   public constructor(id: number) {
      this.id = id;
      this.users = new Set<User>();
   }


}
