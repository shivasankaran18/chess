import { prisma } from "db";
import { createClient, RedisClientType } from "redis";

export class RedisManager {
   public client: RedisClientType;
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
         await prisma.game.update({
            where: { id: gameId },
            data: {
               status: "IN_PROGRESS",
               currentFen,
               blackPlayerId: userId,
            },
         });
      } catch (error) {
         console.error("Error joining game:", error);
      }
   }

   public async addMove(
      gameId: number,
      from: string,
      to: string,
      playerId: number,
      currentFen: string,
   ) {
      try {
         const lastMove = await prisma.move.findFirst({
            where: { gameId },
            orderBy: { createdAt: "desc" },
         });
         await prisma.move.create({
            data: {
               gameId,
               moveNumber: lastMove ? lastMove.moveNumber + 1 : 1,
               from,
               to,
               playerId,
            },
         });
      } catch (error) {
         console.error("Error adding move:", error);
      }
   }
   public async endGame(gameId: number, status: string, winnerId?: number) {
      try {
         await prisma.game.update({
            where: { id: gameId },
            data: {
               status:status as "COMPLETED" | "PLAYER_EXIT",
               winPlayerId: winnerId ?? null,
            },
         });
      } catch (error) {
         console.error("Error ending game:", error);
      }
   }
}
