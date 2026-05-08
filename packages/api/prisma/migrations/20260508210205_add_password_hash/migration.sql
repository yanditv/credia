-- Migration to add passwordHash to User table
-- Column starts as nullable, seed.ts sets password for existing users

ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;