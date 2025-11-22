import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Crear usuario de ejemplo
  const user = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: {
      email: 'admin@local.test',
      name: 'Admin',
      password: 'changeme',
      role: 'ADMIN',
    },
  });

  // Crear productos de ejemplo
  const product1 = await prisma.product.upsert({
    where: { id: 'prod-1' },
    update: {},
    create: {
      id: 'prod-1',
      name: 'Refrigerador Modelo A',
      slug: 'refrigerador-modelo-a',
      description: 'Refrigerador eficiente',
      price: 499.99,
      stock: 10,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 'prod-2' },
    update: {},
    create: {
      id: 'prod-2',
      name: 'Refrigerador Modelo B',
      slug: 'refrigerador-modelo-b',
      description: 'Refrigerador compacto',
      price: 349.99,
      stock: 5,
    },
  });

  // Crear una orden de ejemplo
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      items: {
        create: [
          { productId: product1.id, quantity: 1, price: product1.price },
          { productId: product2.id, quantity: 2, price: product2.price },
        ],
      },
      total: product1.price + product2.price * 2,
      status: 'PENDING',
    },
    include: { items: true },
  });

  console.log({ user, product1, product2, order });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
