/*
  Warnings:

  - You are about to drop the column `traccar_token` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `traccar_url` on the `settings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "traccar_logs" DROP CONSTRAINT "traccar_logs_tag_id_fkey";

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "traccar_token",
DROP COLUMN "traccar_url";

-- AlterTable
ALTER TABLE "sync_logs" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "traccar_logs" ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "sync_operations" (
    "id" TEXT NOT NULL,
    "total_tags" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL,
    "failed_count" INTEGER NOT NULL,
    "duration_ms" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_operations_created_at_idx" ON "sync_operations"("created_at");

-- CreateIndex
CREATE INDEX "sync_operations_status_created_at_idx" ON "sync_operations"("status", "created_at");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traccar_logs" ADD CONSTRAINT "traccar_logs_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
