import { GAME_START } from "types"; 
import { Game } from "./Game";
import { WebSocket } from "ws";

export class GameManager {
   private games: Game[];
   private static gameManagerInstance: GameManager;
   private pendingUser: WebSocket | null;
   private users: WebSocket[];

   private constructor() {
      this.games = [];
      this.pendingUser = null;
      this.users = [];
   }

   public static getInstance(): GameManager {
      if (!this.gameManagerInstance) {
         this.gameManagerInstance = new GameManager();
      }
      return this.gameManagerInstance;
   }

   public addUser(user: WebSocket): void {
      this.users.push(user);
      this.helper(user);
   }

   public removeUser(user: WebSocket): void {
      this.users = this.users.filter((u) => u !== user);
   }

   private helper(user: WebSocket): void {
      user.on("message", (data) => {

         let message = JSON.parse(data.toString());
         
         if (message.type == GAME_START) {
            if (this.pendingUser) {
               const game = new Game(this.pendingUser, user);
               this.games.push(game);
               this.pendingUser = null;
            } else {
               this.pendingUser = user;
            }
         }
         if(message.type == 'game_move') {
            let game=this.games.find(g => g.player1 === user || g.player2 === user);
            game?.makeMove(message.move,user);
         }
      


      });
   }
}
