import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Product Variants')
@Controller('products')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  // ===== PUBLIC ENDPOINTS =====

  @Get('variants/:slug')
  @ApiOperation({
    summary: 'Get variant by slug with product and sibling variants',
  })
  @ApiParam({ name: 'slug', description: 'Variant slug' })
  @ApiResponse({ status: 200, description: 'Variant with product data' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async findVariantBySlug(@Param('slug') slug: string) {
    return this.variantsService.findBySlugWithProduct(slug);
  }

  @Get(':productId/variants')
  @ApiOperation({ summary: 'Get all variants for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of variants' })
  async findVariantsByProduct(
    @Param('productId') productId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.variantsService.findByProduct(
      productId,
      includeInactive === 'true',
    );
  }

  // ===== ADMIN ENDPOINTS =====

  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new variant for a product (Admin)' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'Variant created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.variantsService.create(productId, dto);
  }

  @Post(':productId/variants/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create variants for a product (Admin)' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'Variants created' })
  async bulkCreateVariants(
    @Param('productId') productId: string,
    @Body() variants: CreateVariantDto[],
  ) {
    return this.variantsService.bulkCreate(productId, variants);
  }

  @Patch('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a variant (Admin)' })
  @ApiParam({ name: 'id', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant updated' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.variantsService.update(id, dto);
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a variant (Admin)' })
  @ApiParam({ name: 'id', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant deleted' })
  @ApiResponse({ status: 404, description: 'Variant not found' })
  async removeVariant(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }
}
