import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const errors = await prisma.syncLog.findMany({
    where: { status: 'ERROR' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  console.log("LAST ERRORS:", JSON.stringify(errors, null, 2));

  const tags = await prisma.tag.findMany({
    include: {
      positions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  console.log("TAGS WITH POSITIONS:", JSON.stringify(tags, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
