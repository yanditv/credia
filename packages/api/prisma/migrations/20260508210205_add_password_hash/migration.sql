-- Migration to add passwordHash to User table
-- Existing users get a temporary password 'demo1234' (bcrypt hash)

ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Hash of 'demo1234' with bcrypt salt rounds 10
UPDATE "User" SET "passwordHash" = '$2b$10$r/GfGgh3vYOLsPckKWqfgO.mub/7bDKxwJZ1jVgjDJtH1rxia2vdy';

ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;