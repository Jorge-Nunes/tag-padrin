-- Migration para adicionar coluna brgps_base_url que estava faltando
-- Esta migration corrige o erro de deploy em produção: P2022 - column settings.brgps_base_url does not exist
-- Issue: A migration anterior (20260209024101_add_brgps_base_url) não continha o comando para adicionar a coluna

-- Adicionar coluna brgps_base_url na tabela settings (IF NOT EXISTS para segurança)
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "brgps_base_url" TEXT;

-- Garantir que a coluna seja nullable (conforme schema.prisma: String?)
ALTER TABLE "settings" ALTER COLUMN "brgps_base_url" DROP NOT NULL;
