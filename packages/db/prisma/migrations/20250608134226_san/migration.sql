/*
  Warnings:

  - You are about to drop the column `from` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Move` table. All the data in the column will be lost.
  - Added the required column `san` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Move" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "san" TEXT NOT NULL;
