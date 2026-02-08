const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.tag.count();
    const tags = await prisma.tag.findMany();
    console.log('Tag count:', count);
    console.log('Tags:', JSON.stringify(tags, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
