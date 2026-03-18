-- CreateIndex
CREATE INDEX "positions_tag_id_created_at_idx" ON "positions"("tag_id", "created_at");

-- CreateIndex
CREATE INDEX "positions_syncedToTraccar_idx" ON "positions"("syncedToTraccar");

-- CreateIndex
CREATE INDEX "sync_logs_created_at_idx" ON "sync_logs"("created_at");

-- CreateIndex
CREATE INDEX "traccar_logs_created_at_idx" ON "traccar_logs"("created_at");

-- CreateIndex
CREATE INDEX "users_brgps_base_url_idx" ON "users"("brgps_base_url");
