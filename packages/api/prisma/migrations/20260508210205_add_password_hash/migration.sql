-- Migration to add passwordHash to User table
-- Existing users get a random bcrypt hash (won't work for login).
-- Seed.ts will update demo users with demo1234 hash.

ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Random bcrypt hash for existing users (bcrypt prefix $2b$10$ is 60 chars, rest is random data)
-- These users won't be able to login until their password is reset via seed or manually.
UPDATE "User" SET "passwordHash" = '$2b$10$' || md5(random()::text || id::text || clock_timestamp()::text);

ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;