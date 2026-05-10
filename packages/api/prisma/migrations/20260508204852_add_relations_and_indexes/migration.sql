-- CreateIndex
CREATE INDEX "CreditScore_userId_createdAt_idx" ON "CreditScore"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IncomeRecord_userId_recordDate_idx" ON "IncomeRecord"("userId", "recordDate");

-- CreateIndex
CREATE INDEX "IncomeRecord_userId_idx" ON "IncomeRecord"("userId");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX "Loan_userId_status_idx" ON "Loan"("userId", "status");

-- CreateIndex
CREATE INDEX "LoanPayment_loanId_idx" ON "LoanPayment"("loanId");

-- CreateIndex
CREATE INDEX "LoanPayment_status_idx" ON "LoanPayment"("status");

-- CreateIndex
CREATE INDEX "LoanRequest_status_idx" ON "LoanRequest"("status");

-- CreateIndex
CREATE INDEX "LoanRequest_userId_status_idx" ON "LoanRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- AddForeignKey
ALTER TABLE "LoanRequest" ADD CONSTRAINT "LoanRequest_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "CreditScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
