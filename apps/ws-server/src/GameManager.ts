import { GAME_CREATED, GAME_NOT_FOUND, GAME_STARTED } from "utils/constants";
import { Game } from "./Game";
import { User } from "./User";
import { move } from "utils/types";
import { prisma } from "db";

let temp=0;


export class GameManager {
   private ongoingGames: Map<number, Game>;
   private static gameManagerInstance: GameManager;
   private pendingGames: Map<number, Game>;

   private constructor() {
      this.ongoingGames = new Map<number, Game>();
      this.pendingGames = new Map<number, Game>();
   }

   public static getInstance(): GameManager {
      if (!this.gameManagerInstance) {
         this.gameManagerInstance = new GameManager();
      }
      return this.gameManagerInstance;
   }

   public async createGame(player1: User) {
      // const g = await prisma.game.create({
      //    data: {
      //       whitePlayerId: player1.user.id,
      //       status: "WAITING_FOR_PLAYER",
      //       timeControl: "CLASSICAL",
      //    },
      // });
      const game = new Game(++temp, player1);
      this.pendingGames.set(game.id, game);
      console.log(this.pendingGames)
      player1.socket.send(JSON.stringify({ type: GAME_CREATED }));
   }
   public startGame(gameId: number, player2: User): void {
      const game = this.pendingGames.get(gameId);
      if (!game) {
         return;
      }
      console.log(`Starting game ${gameId} with player ${player2.user.name}`);
      game.player2 = player2;
      this.pendingGames.delete(gameId);
      this.ongoingGames.set(gameId, game);
      game.player1.socket.send(
         JSON.stringify({
            type: GAME_STARTED,
            whitePlayer: game.player1.user,
            blackPlayer: game.player2.user,
            gameId: game.id,
         }),
      );
      game.player2.socket.send(
         JSON.stringify({
            type: GAME_STARTED,
            whitePlayer: game.player1.user,
            blackPlayer: game.player2.user,
            gameId: game.id,
         }),
      );
   }

   public makeMove(move: move, user: User, gameId: number): void {
      const game = this.ongoingGames.get(gameId);

      if (!game) {
         console.log("no game")
         user.socket.send(JSON.stringify({ type: GAME_NOT_FOUND }));
         return;
      }
      console.log("reached here in makeMove");
      game.makeMove(move, user);
   }
}
