import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let availableStock = product.stock;

    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      if (!variant.isActive) {
        throw new BadRequestException('Variant is not available');
      }

      availableStock = variant.stock;
    }

    if (availableStock <= 0) {
      throw new BadRequestException('Product is out of stock');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (newQuantity > availableStock) {
        throw new BadRequestException(`Only ${availableStock} units available`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true, variant: true },
      });
    } else {
      if (dto.quantity > availableStock) {
        throw new BadRequestException(`Only ${availableStock} units available`);
      }

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

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let availableStock = product.stock;

    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (variant) {
        availableStock = variant.stock;
      }
    }

    if (dto.quantity > availableStock) {
      throw new BadRequestException(`Only ${availableStock} units available`);
    }

    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
      include: { product: true, variant: true },
    });
  }

  async removeFromCart(userId: string, productId: string, variantId?: string) {
    const cart = await this.getCart(userId);

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
    for (const item of items) {
      try {
        await this.addToCart(userId, item);
      } catch (error) {
        if (error instanceof BadRequestException) {
          continue;
        }
        throw error;
      }
    }

    return this.getCart(userId);
  }
}
