import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);

    // Find existing item with same product AND variant
    // Note: Prisma unique index with nullable field requires findFirst instead of findUnique
    // when variantId is null (SQL NULL != NULL)
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
        include: { product: true, variant: true },
      });
    } else {
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId ?? null,
          quantity: dto.quantity,
        },
        include: { product: true, variant: true },
      });
    }
  }

  async updateCartItem(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
    variantId?: string,
  ) {
    const cart = await this.getCart(userId);

    // Use findFirst instead of findUnique for nullable variantId
    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        variantId: variantId ?? null,
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
      include: { product: true, variant: true },
    });
  }

  async removeFromCart(userId: string, productId: string, variantId?: string) {
    const cart = await this.getCart(userId);

    // Use findFirst instead of findUnique for nullable variantId
    const item = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        variantId: variantId ?? null,
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    return this.prisma.cartItem.delete({
      where: { id: item.id },
    });
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    return this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  async mergeCart(userId: string, items: AddToCartDto[]) {
    // We don't need to get the cart here, addToCart handles it
    for (const item of items) {
      await this.addToCart(userId, item);
    }

    return this.getCart(userId);
  }
}
