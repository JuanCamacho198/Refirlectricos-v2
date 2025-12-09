import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  IsInt,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty({
    description: 'Variant display name',
    example: '1/4 HP - 110V',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if not provided)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Unique SKU for this variant',
    example: 'COMP-EMB-14HP',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ description: 'Price for this variant', example: 350000 })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiPropertyOptional({ description: 'Original price before discount' })
  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @ApiProperty({ description: 'Stock quantity', example: 10 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'Main image URL for this variant' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Gallery images for this variant',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images_url?: string[];

  @ApiPropertyOptional({
    description: 'Variant attributes as key-value pairs',
    example: { potencia: '1/4 HP', voltaje: '110V' },
  })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Is this the default variant?',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Is this variant active?',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order position', default: 0 })
  @IsInt()
  @IsOptional()
  position?: number;
}

export class UpdateVariantDto {
  @ApiPropertyOptional({ description: 'Variant display name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Unique SKU for this variant' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'Price for this variant' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Original price before discount' })
  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Stock quantity' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ description: 'Main image URL for this variant' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional({ description: 'Gallery images for this variant' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images_url?: string[];

  @ApiPropertyOptional({ description: 'Variant attributes as key-value pairs' })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Is this the default variant?' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Is this variant active?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order position' })
  @IsInt()
  @IsOptional()
  position?: number;
}
