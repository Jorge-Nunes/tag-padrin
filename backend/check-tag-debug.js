const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTag() {
    try {
        const tag = await prisma.tag.findFirst({
            where: { brgpsId: '3092510800' }
        });
        console.log('Tag found:', JSON.stringify(tag, null, 2));

        const syncLogs = await prisma.syncLog.findMany({
            where: { tagId: tag?.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log('Recent Sync Logs:', JSON.stringify(syncLogs, null, 2));

        const settings = await prisma.systemSettings.findFirst();
        console.log('Settings:', JSON.stringify(settings, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTag();
