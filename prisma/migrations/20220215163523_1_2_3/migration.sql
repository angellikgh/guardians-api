/*
  Warnings:

  - You are about to drop the column `hra_reasons` on the `quotes` table. All the data in the column will be lost.
  - You are about to drop the column `offers_group_medical` on the `quotes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quotes" DROP COLUMN "hra_reasons",
DROP COLUMN "offers_group_medical",
ADD COLUMN     "selected_ICHRA_contribution" INTEGER;
