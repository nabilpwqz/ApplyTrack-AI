-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT,
    "salary" TEXT,
    "jobUrl" TEXT,
    "description" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
