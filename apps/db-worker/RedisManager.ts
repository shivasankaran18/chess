import { createClient, RedisClientType } from "redis";
import { calculateElo } from "./elo";
import { prisma } from "db";

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
      san: string,
      playerId: number,
      currentFen: string,
   ) {
      try {
         await prisma.$transaction(async (tx) => {
            const lastMove = await tx.move.findFirst({
               where: { gameId },
               orderBy: { createdAt: "desc" },
            });
            await tx.move.create({
               data: {
                  gameId,
                  moveNumber: lastMove ? lastMove.moveNumber + 1 : 1,
                  san,
                  playerId,
               },
            });
            await tx.game.update({
               where: {
                  id: gameId,
               },
               data: {
                  currentFen,
               },
            });
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
               status: status as "COMPLETED" | "PLAYER_EXIT",
               winPlayerId: winnerId ?? null,
            },
         });
      } catch (error) {
         console.error("Error ending game:", error);
      }
   }
   public async updateRating(gameId:number,winnerId: number, loserId: number) {
      try {
         const winner = await prisma.user.findUnique({
            where: { id: winnerId },
         });
         const loser = await prisma.user.findUnique({
            where: { id: loserId },
         });

         if (!winner || !loser) {
            return;
         }

         const { newRa, newRb } = calculateElo(
            winner?.rating,
            loser?.rating,
            1,
            0,
            32,
         );

         let changeA=newRa- winner.rating;
         let changeB=newRb-loser.rating;
         const game= await prisma.game.findUnique({
            where: { id: gameId },
         })
         if(game==null)
         {
            return;
         }
         await prisma.$transaction(async (tx) => {
            await tx.user.update({
               where: { id: winnerId },
               data: { rating: newRa },
            });

            await tx.user.update({
               where: { id: loserId },
               data: { rating: newRb },
            });
            if(winner.id===game.whitePlayerId){
               await tx.game.update({
                  where: { id: gameId },
                  data: {
                     whitePlayerRatingChange: changeA,
                     blackPlayerRatingChange: changeB,
                  },
               });
            }
            else
            {
               await tx.game.update({
                  where: { id: gameId },
                  data: {
                     whitePlayerRatingChange: changeB,
                     blackPlayerRatingChange: changeA,
                  },
               });
            }
            
         });
      } catch (error) {
         console.error("Error updating rating:", error);
      }
   }
}
