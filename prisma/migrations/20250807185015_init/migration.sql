/*
  Warnings:

  - The primary key for the `EventLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userEmail` on the `EventLog` table. All the data in the column will be lost.
  - You are about to drop the `UserPhone` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventId` to the `EventLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EventLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `EventLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."EventLog" DROP CONSTRAINT "EventLog_pkey",
DROP COLUMN "userEmail",
ADD COLUMN     "callTime" TIMESTAMP(3),
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EventLog_id_seq";

-- DropTable
DROP TABLE "public"."UserPhone";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."EventLog" ADD CONSTRAINT "EventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
