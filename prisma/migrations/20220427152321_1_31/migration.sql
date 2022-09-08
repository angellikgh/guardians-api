-- AlterTable
ALTER TABLE "rates" ADD COLUMN     "quotes_submission_history_id" TEXT;

-- CreateTable
CREATE TABLE "quotes_submission_history" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRequote" BOOLEAN NOT NULL DEFAULT false,
    "isReportSent" BOOLEAN NOT NULL DEFAULT false,
    "quote_id" TEXT,

    CONSTRAINT "quotes_submission_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rates" ADD CONSTRAINT "rates_quotes_submission_history_id_fkey" FOREIGN KEY ("quotes_submission_history_id") REFERENCES "quotes_submission_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes_submission_history" ADD CONSTRAINT "quotes_submission_history_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
