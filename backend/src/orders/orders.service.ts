/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Product, Order } from '../../generated/prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const { userId, items, status, addressId, notes } = createOrderDto;

    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verificar dirección
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException(
        `Address with ID ${addressId} not found or does not belong to user`,
      );
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

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
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
          shippingName: address.fullName,
          shippingPhone: address.phone,
          shippingAddress:
            `${address.addressLine1} ${address.addressLine2 || ''}`.trim(),
          shippingCity: address.city,
          shippingState: address.state,
          shippingZip: address.zipCode,
          shippingCountry: address.country,
          shippingNotes: notes,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Decrementar stock de los productos
      for (const it of orderItemsData) {
        await prisma.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

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

  findAllByUser(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const { status, notes } = updateOrderDto;

    // Filtrar y mapear datos válidos para Prisma
    const data: any = {};
    if (notes) data.shippingNotes = notes;
    // Nota: userId, items y addressId se ignoran en la actualización directa
    // para evitar inconsistencias. Si se requiere actualizar items,
    // se debería implementar una lógica específica.

    // Si no hay cambio de estado, actualización simple
    if (!status) {
      return this.prisma.order.update({
        where: { id },
        data,
      });
    }

    // Obtener orden actual con items para manejar stock
    const currentOrder = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!currentOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Si el estado no cambia, retornar
    if (currentOrder.status === status) {
      return this.prisma.order.update({
        where: { id },
        data: { ...data, status },
      });
    }

    const updatedOrder = await this.prisma.$transaction(async (prisma) => {
      // Caso 1: Cancelar orden (Restaurar stock)
      if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        for (const item of currentOrder.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Caso 2: Reactivar orden cancelada (Descontar stock)
      if (status !== 'CANCELLED' && currentOrder.status === 'CANCELLED') {
        for (const item of currentOrder.items) {
          // Verificar stock antes de descontar
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product ${product?.name || item.productId} to reactivate order`,
            );
          }

          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Actualizar la orden
      return prisma.order.update({
        where: { id },
        data: { ...data, status },
      });
    });

    // Enviar notificación si el estado cambia a DELIVERED
    if (status === 'DELIVERED' && currentOrder.status !== 'DELIVERED') {
      await this.notificationsService.create(
        currentOrder.userId,
        '¡Tu pedido ha llegado!',
        `El pedido #${currentOrder.id.slice(-6)} ha sido entregado. Por favor, califica tus productos.`,
        'ORDER_DELIVERED',
        `/profile/orders/${currentOrder.id}`,
      );
    }

    return updatedOrder;
  }

  remove(id: string): Promise<Order> {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
