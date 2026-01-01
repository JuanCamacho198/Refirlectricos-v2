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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/enums';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Throttle({ short: { limit: 5, ttl: 1000 } }) // 5 órdenes por segundo
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('mine')
  findAllMyOrders(@Request() req: RequestWithUser) {
    return this.ordersService.findAllByUser(req.user.userId);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAllByUser(@Param('userId') userId: string) {
    return this.ordersService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
