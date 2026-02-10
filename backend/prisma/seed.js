const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@tagpadrin.com' },
    update: {},
    create: {
      email: 'admin@tagpadrin.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  // Criar configurações padrão
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      syncInterval: 60,
      brgpsBaseUrl: '',
      brgpsToken: '',
      traccarUrl: 'http://localhost:5055',
      traccarToken: '',
    },
  });

  console.log('Seed concluído com sucesso!');
  console.log('Usuário: admin@tagpadrin.com');
  console.log('Senha: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
