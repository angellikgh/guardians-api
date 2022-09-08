-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "processed_date" TEXT;
ALTER TABLE "quotes" ADD COLUMN     "has_declined_health_coverage" BOOLEAN;

-- AlterTable
ALTER TABLE "rates"  ADD COLUMN     "has_declined_product" BOOLEAN;

-- CreateTable
CREATE TABLE "esigns" (
    "user" TEXT NOT NULL,
    "signed_at" TEXT NOT NULL,
    "benefit_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,

    CONSTRAINT "esigns_pkey" PRIMARY KEY ("user","signed_at","benefit_id")
);

-- AddForeignKey
ALTER TABLE "esigns" ADD CONSTRAINT "esigns_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "benefits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esigns" ADD CONSTRAINT "esigns_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esigns" ADD CONSTRAINT "esigns_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "benefits" ADD COLUMN     "previous_employee_selection" "EmployeeSelection";
