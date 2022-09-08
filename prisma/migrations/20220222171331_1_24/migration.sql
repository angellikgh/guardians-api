-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "hours_worked_per_week" DOUBLE PRECISION NOT NULL DEFAULT 12.5;

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "send_to" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "date_sent" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
