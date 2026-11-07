/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Media_publicId_key" ON "Media"("publicId");
