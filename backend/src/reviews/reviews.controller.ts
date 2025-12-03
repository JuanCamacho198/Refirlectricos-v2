import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser {
  user: {
    userId: string;
  };
}

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @Get('product/:productId')
  findAllByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findAllByProduct(productId);
  }

  @Get('eligibility/:productId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  checkEligibility(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.checkEligibility(req.user.userId, productId);
  }

  @Get('user/my-reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAllByUser(@Request() req: RequestWithUser) {
    return this.reviewsService.findAllByUser(req.user.userId);
  }

  @Get('user/pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findPendingByUser(@Request() req: RequestWithUser) {
    return this.reviewsService.findPendingByUser(req.user.userId);
  }
}
