/*
  Warnings:

  - You are about to drop the column `master_application_document_url` on the `quotes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quotes" DROP COLUMN "master_application_document_url";

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "document_date" TEXT NOT NULL,
    "document_download_asset_path" TEXT NOT NULL,
    "document_title" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
