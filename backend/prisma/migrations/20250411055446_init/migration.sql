/*
  Warnings:

  - Added the required column `sender` to the `gemini` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gemini" ADD COLUMN     "sender" TEXT NOT NULL;
