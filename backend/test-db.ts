import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Iniciando teste de banco de dados...');
    try {
        const count = await prisma.tag.count();
        console.log(`Total de tags: ${count}`);

        const tags = await prisma.tag.findMany({
            take: 1
        });
        console.log('Primeira tag:', tags[0]);

        console.log('Teste de criação...');
        // Tenta criar apenas se não existir (para não sujar muito)
        // Mas melhor apenas ler por enquanto.

        console.log('SUCCESSO: Banco acessível.');
    } catch (e) {
        console.error('ERRO FATAL:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
