/*
  Warnings:

  - You are about to drop the column `event` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `opening` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `after` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `before` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `san` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.
  - Added the required column `playerId` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "event",
DROP COLUMN "opening";

-- AlterTable
ALTER TABLE "Move" DROP COLUMN "after",
DROP COLUMN "before",
DROP COLUMN "san",
ADD COLUMN     "playerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastLogin";

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
