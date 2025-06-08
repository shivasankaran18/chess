import { RedisManager } from "./RedisManager";
import { ADD_MOVE, END_GAME, JOIN_GAME, UPDATE_RATING } from "utils/constants";
const redisManager = RedisManager.getInstance();

async function main() {
   try {
      while (true) {
         const response = await redisManager.client.lPop("game");
         if (!response) {
            continue;
         }
         const data = JSON.parse(response);
         console.log("Received data:", data);

         if (!data) {
            continue;
         }
         if (data.type === JOIN_GAME) {
            const { gameId, userId, currentFen, status } = data;
            console.log(
               `User ${userId} joined game ${gameId} with status ${status}`,
            );
            await redisManager.joinGame(gameId, userId, currentFen);
         } else if (data.type === ADD_MOVE) {
            const { gameId, san, playerId, currentFen } = data;

            await redisManager.addMove(gameId, san, playerId, currentFen);
         } else if (data.type === END_GAME) {
            const { gameId, status, winnerId = null } = data;
            await redisManager.endGame(gameId, status, winnerId);
         } else if (data.type === UPDATE_RATING) {
            const { gameId,winnerId, loserId } = data;
            redisManager.updateRating(gameId,winnerId, loserId);
         }
      }
   } catch (error) {
      console.error("Error in main:", error);
   }
}
main();
