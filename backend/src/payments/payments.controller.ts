import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { EpaycoConfirmationDto } from './dto/epayco-confirmation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create an ePayco payment session
   * Called by frontend when user clicks "Pay with ePayco"
   * Returns form data to submit to ePayco checkout
   */
  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create ePayco payment session' })
  @ApiResponse({
    status: 201,
    description: 'Payment session created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        orderId: { type: 'string' },
        epaycoData: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid cart data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  async createSession(@Body() dto: CreatePaymentSessionDto) {
    return this.paymentsService.createEpaycoSession(dto);
  }

  /**
   * ePayco webhook confirmation endpoint
   * Called by ePayco servers after payment completion
   * MUST be publicly accessible (no auth guard)
   */
  @Post('epayco-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ePayco webhook confirmation (public)' })
  @ApiResponse({
    status: 200,
    description: 'Webhook received and processed',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async epaycoConfirmation(@Body() body: EpaycoConfirmationDto) {
    return this.paymentsService.handleEpaycoConfirmation(body);
  }

  /**
   * Get order payment status
   * Used by frontend success page to display result
   */
  @Get('order-status/:orderId')
  @ApiOperation({ summary: 'Get order payment status' })
  @ApiResponse({
    status: 200,
    description: 'Order status retrieved',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        status: { type: 'string' },
        paymentStatus: { type: 'string' },
        total: { type: 'number' },
        paymentReference: { type: 'string' },
        paymentMethod: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderPaymentStatus(orderId);
  }
}
