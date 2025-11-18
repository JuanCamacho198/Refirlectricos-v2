/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Product, Order } from '../../generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { userId, items, status } = createOrderDto;

    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!items || items.length === 0) {
      throw new NotFoundException('Order must contain at least one item');
    }

    // Obtener todos los productos involucrados en una sola consulta
    const productIds = items.map((it) => it.productId);
    const products: Product[] = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productsMap = new Map(products.map((p: Product) => [p.id, p]));

    // Preparar los datos de los items y calcular total
    let total = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Aquí podríamos verificar stock y lanzar error si no hay suficiente
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Crear la orden en una transacción para mantener consistencia
    const createdOrder = await this.prisma.$transaction(async (prisma: any) => {
      const order = await prisma.order.create({
        data: {
          userId,
          status,
          total,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Opcional: decrementar stock de los productos (comentado por ahora)
      // for (const it of orderItemsData) {
      //   await prisma.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
      // }

      return order;
    });

    return createdOrder as Order;
  }

  findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  findOne(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    // Nota: Actualizar una orden es complejo si cambian los items (recalcular total, stock, etc.)
    // Por simplicidad, aquí permitimos actualizar estado u otros campos simples.
    // Si se actualizan items, requeriría lógica adicional.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items, ...data } = updateOrderDto;
    return this.prisma.order.update({
      where: { id },
      data: data,
    });
  }

  remove(id: string): Promise<Order> {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
