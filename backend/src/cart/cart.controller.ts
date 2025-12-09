import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    userId: string;
  };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: RequestWithUser) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addToCart(
    @Request() req: RequestWithUser,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Patch('items/:id')
  updateCartItem(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Query('variantId') variantId: string | undefined,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.userId,
      id,
      updateCartItemDto,
      variantId,
    );
  }

  @Delete('items/:id')
  removeFromCart(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Query('variantId') variantId: string | undefined,
  ) {
    return this.cartService.removeFromCart(req.user.userId, id, variantId);
  }

  @Delete()
  clearCart(@Request() req: RequestWithUser) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Post('merge')
  mergeCart(@Request() req: RequestWithUser, @Body() items: AddToCartDto[]) {
    return this.cartService.mergeCart(req.user.userId, items);
  }
}
