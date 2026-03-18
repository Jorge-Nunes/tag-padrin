const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Verificar se o usuário admin já existe
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@tagpadrin.com' },
        });

        if (existingAdmin) {
            console.log('✅ Usuário admin já existe!');
            console.log('Email:', existingAdmin.email);
            console.log('ID:', existingAdmin.id);
            console.log('Role:', existingAdmin.role);

            // Atualizar a senha para admin123
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.update({
                where: { email: 'admin@tagpadrin.com' },
                data: { password: hashedPassword },
            });
            console.log('🔑 Senha atualizada para: admin123');
        } else {
            // Criar novo usuário admin
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = await prisma.user.create({
                data: {
                    email: 'admin@tagpadrin.com',
                    password: hashedPassword,
                    name: 'Administrador',
                    role: 'ADMIN',
                    syncInterval: 60,
                    brgpsBaseUrl: '',
                    brgpsToken: '',
                },
            });

            console.log('✅ Usuário admin criado com sucesso!');
            console.log('Email:', admin.email);
            console.log('Senha: admin123');
            console.log('ID:', admin.id);
            console.log('Role:', admin.role);
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
