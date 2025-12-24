import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'cm3...' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 4.5, minimum: 0.5, maximum: 5 })
  @IsNumber()
  @Min(0.5)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Excelente producto', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
