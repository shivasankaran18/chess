/*
  Warnings:

  - You are about to drop the column `result` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `timeControl` on the `Game` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Game_status_result_idx";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "result",
DROP COLUMN "timeControl",
ADD COLUMN     "winPlayerId" INTEGER;

-- DropEnum
DROP TYPE "TimeControl";

-- CreateIndex
CREATE INDEX "Game_id_idx" ON "Game"("id");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winPlayerId_fkey" FOREIGN KEY ("winPlayerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
