-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);
