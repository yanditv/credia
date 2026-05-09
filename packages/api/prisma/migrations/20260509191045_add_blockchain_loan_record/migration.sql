-- Add blockchainLoanRecord to Loan table for storing Solana PDA address
ALTER TABLE "Loan" ADD COLUMN "blockchainLoanRecord" TEXT;
