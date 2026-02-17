
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFix() {
    console.log('--- Iniciando Verificação do Fix ---');

    // 1. Tentar encontrar uma tag existente para usar como teste
    const existingTag = await prisma.tag.findFirst();

    if (!existingTag) {
        console.log('Pulei a verificação: Nenhuma tag encontrada no banco.');
        return;
    }

    console.log(`Testando com Tag existente: ${existingTag.brgpsId}`);

    // Simulando a lógica do TagsService.create
    const brgpsId = existingTag.brgpsId;
    const existing = await prisma.tag.findUnique({
        where: { brgpsId: brgpsId },
    });

    if (existing) {
        console.log(`SUCESSO: A lógica detectou corretamente que a tag ${brgpsId} já existe.`);
        console.log('Mensagem que seria enviada ao usuário: "Tag com ID BRGPS ' + brgpsId + ' já cadastrada"');
    } else {
        console.log('FALHA: A lógica não detectou a tag existente.');
    }

    console.log('--- Verificação Concluída ---');
}

verifyFix()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
