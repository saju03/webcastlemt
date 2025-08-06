/*
  Warnings:

  - You are about to drop the column `verified` on the `UserPhone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserPhone" DROP COLUMN "verified",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."EventLog" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "called" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);
