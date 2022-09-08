-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('INVITED', 'IN_PROGRESS', 'ENROLLED');

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT E'INVITED';
