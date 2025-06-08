import { createClient, RedisClientType } from "redis";
import { ADD_MOVE, END_GAME, JOIN_GAME, UPDATE_RATING } from "utils/constants";

export class RedisManager {
   private client: RedisClientType;
   private static redisManagerInstance: RedisManager;

   private constructor() {
      this.client = createClient();
      this.client.connect();
   }

   public static getInstance(): RedisManager {
      if (!this.redisManagerInstance) {
         this.redisManagerInstance = new RedisManager();
      }
      return this.redisManagerInstance;
   }

   public async joinGame(gameId: number, userId: number, currentFen: string) {
      try {
         await this.client.rPush(
            "game",
            JSON.stringify({
               type: JOIN_GAME,
               gameId,
               userId,
               currentFen,
               status: "IN_PROGRESS",
            }),
         );
      } catch (error) {
         console.error("Error joining game:", error);
      }
   }

   public async addMove(
      gameId: number,
      san: string,
      playerId: number,
      currentFen: string,
   ) {
      try {
         await this.client.rPush(
            "game",
            JSON.stringify({
               type: ADD_MOVE,
               gameId,
               san, 
               playerId,
               currentFen,
            }),
         );
      } catch (error) {
         console.error("Error adding move:", error);
      }
   }

   public async endGame(gameId: number, status: string, winnerId?: number) {
      try {
         if (status === "COMPLETED") {
            await this.client.rPush(
               "game",
               JSON.stringify({
                  type: END_GAME,
                  gameId,
                  status,
                  winnerId,
               }),
            );
         } else {
            await this.client.rPush(
               "game",
               JSON.stringify({
                  type: END_GAME,
                  gameId,
                  status,
               }),
            );
         }
      } catch (error) {
         console.error("Error ending game:", error);
      }
   }

   public async updateRating(gameId:number,winnerId: number, loserId: number) {
      try {
         this.client.rPush(
            "game",
            JSON.stringify({
               type: UPDATE_RATING,
               gameId,
               winnerId,
               loserId,
            }),
         );
      } catch (error) {
         console.error("Error updating rating:", error);
      }
   }
}
