-- Prisma Migrate SQL migration
ALTER TABLE "UserResume" ADD COLUMN "fileKey" text;
ALTER TABLE "UserResume" ADD COLUMN "fileHash" text;
