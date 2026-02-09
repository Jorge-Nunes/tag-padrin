/*
  Warnings:

  - You are about to drop the column `altitude` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `battery` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `gps_signal` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `gsm_signal` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `mileage` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `imei` on the `tags` table. All the data in the column will be lost.
  - The `response` column on the `traccar_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `sync_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `traccar_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "sync_logs" DROP CONSTRAINT "sync_logs_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "traccar_logs" DROP CONSTRAINT "traccar_logs_tag_id_fkey";

-- DropIndex
DROP INDEX "positions_tag_id_idx";

-- DropIndex
DROP INDEX "positions_timestamp_idx";

-- DropIndex
DROP INDEX "sync_logs_created_at_idx";

-- DropIndex
DROP INDEX "sync_logs_tag_id_idx";

-- DropIndex
DROP INDEX "traccar_logs_created_at_idx";

-- DropIndex
DROP INDEX "traccar_logs_tag_id_idx";

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "altitude",
DROP COLUMN "battery",
DROP COLUMN "gps_signal",
DROP COLUMN "gsm_signal",
DROP COLUMN "mileage",
ADD COLUMN     "course" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "id" SET DEFAULT 'default',
ALTER COLUMN "brgps_token" DROP NOT NULL,
ALTER COLUMN "traccar_url" DROP NOT NULL,
ALTER COLUMN "traccar_token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sync_logs" ALTER COLUMN "tag_id" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "imei";

-- AlterTable
ALTER TABLE "traccar_logs" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "payload" DROP NOT NULL,
DROP COLUMN "response",
ADD COLUMN     "response" JSONB;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

-- DropEnum
DROP TYPE "SyncStatus";

-- CreateIndex
CREATE INDEX "positions_tag_id_timestamp_idx" ON "positions"("tag_id", "timestamp");

-- CreateIndex
CREATE INDEX "positions_created_at_idx" ON "positions"("created_at");

-- CreateIndex
CREATE INDEX "sync_logs_tag_id_created_at_idx" ON "sync_logs"("tag_id", "created_at");

-- CreateIndex
CREATE INDEX "sync_logs_status_created_at_idx" ON "sync_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "tags_last_sync_at_idx" ON "tags"("last_sync_at");

-- CreateIndex
CREATE INDEX "tags_status_idx" ON "tags"("status");

-- CreateIndex
CREATE INDEX "traccar_logs_tag_id_created_at_idx" ON "traccar_logs"("tag_id", "created_at");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traccar_logs" ADD CONSTRAINT "traccar_logs_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
