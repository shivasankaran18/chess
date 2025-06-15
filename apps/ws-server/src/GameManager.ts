import { GAME_CREATED, GAME_NOT_FOUND, GAME_STARTED } from "utils/constants";
import { Game } from "./Game";
import { User } from "./User";
import { move } from "utils/types";
import { prisma } from "db";
import { RedisManager } from "./RedisManager";

const redisManager=RedisManager.getInstance();

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
      const g = await prisma.game.create({
         data:{
            whitePlayerId: player1.user.id,
            status:"WAITING_FOR_PLAYER",

         }
      })
      const game = new Game(g.id, player1);
      this.pendingGames.set(game.id, game);
      player1.socket.send(JSON.stringify({ type: GAME_CREATED }));
   }
   public startGame(gameId: number, player2: User): void {
      const game = this.pendingGames.get(gameId);
      if (!game) {
         return;
      }
      game.player2 = player2;
      redisManager.joinGame(game.id, game.player2.user.id, game.board.fen());
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
      game.makeMove(move, user);
   }

   public sendMessage(message: string, user: User, gameId: number): void {
      const game = this.ongoingGames.get(gameId);
      if (!game) {
         user.socket.send(JSON.stringify({ type: GAME_NOT_FOUND }));
         return;
      }
      game.sendMessage(message, user);
   }



}
