import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  await prisma.videoProposal.create({
    data: {
      title: 'Aprendiendo Next.js 14',
      description: 'Un vídeo tutorial sobre las nuevas características de Next.js 14, incluyendo Server Actions.',
      thumbnailUrl: 'https://i.ytimg.com/vi/d5x0gyI12_g/maxresdefault.jpg',
    },
  });

  await prisma.videoProposal.create({
    data: {
      title: 'Estilizando con Tailwind CSS',
      description: 'Cómo crear diseños modernos y responsivos utilizando Tailwind CSS y sus clases de utilidad.',
      thumbnailUrl: 'https://i.ytimg.com/vi/pfaSUYaSgPo/maxresdefault.jpg',
    },
  });
  
  await prisma.videoProposal.create({
    data: {
      title: 'Autenticación con NextAuth.js',
      description: 'Guía completa para implementar autenticación con Google, GitHub y más en tu aplicación Next.js.',
      thumbnailUrl: 'https://i.ytimg.com/vi/1v_4qBvGgQA/maxresdefault.jpg',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
