/*
  Warnings:

  - A unique constraint covering the columns `[user_id,brgps_id]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tags_brgps_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_brgps_id_key" ON "tags"("user_id", "brgps_id");
