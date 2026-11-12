-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "publishingLockExpiresAt" TIMESTAMP(3),
ADD COLUMN     "publishingLockToken" TEXT;
