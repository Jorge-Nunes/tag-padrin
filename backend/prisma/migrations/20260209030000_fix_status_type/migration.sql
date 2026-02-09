-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tags" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "tags" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE IF EXISTS "Status";
