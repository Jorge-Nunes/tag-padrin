import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando correção do banco de dados...');
    try {
        console.log('Adicionando coluna isActive em tags...');
        await prisma.$executeRawUnsafe('ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;');

        console.log('Adicionando coluna syncedToTraccar em positions...');
        await prisma.$executeRawUnsafe('ALTER TABLE "positions" ADD COLUMN IF NOT EXISTS "syncedToTraccar" BOOLEAN NOT NULL DEFAULT false;');

        console.log('SUCESSO: Colunas criadas/verificadas.');
    } catch (e) {
        console.error('ERRO:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
