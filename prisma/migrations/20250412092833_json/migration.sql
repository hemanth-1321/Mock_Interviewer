/*
  Warnings:

  - The `categoryScores` column on the `Feedback` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "categoryScores",
ADD COLUMN     "categoryScores" JSONB;
