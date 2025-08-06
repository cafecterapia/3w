-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "classCount" INTEGER,
ADD COLUMN     "classesUsed" INTEGER DEFAULT 0,
ADD COLUMN     "schedulingOption" TEXT;
