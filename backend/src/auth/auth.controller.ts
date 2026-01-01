import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

interface RequestWithUser {
  user: {
    userId: string;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ short: { limit: 3, ttl: 1000 } }) // 3 requests por segundo
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Throttle({ short: { limit: 2, ttl: 1000 } }) // 2 requests por segundo
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Throttle({ short: { limit: 5, ttl: 1000 } }) // 5 requests por segundo
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(@Body('refresh_token') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout-all')
  async logoutAll(@Request() req: RequestWithUser) {
    await this.authService.revokeRefreshTokens(req.user.userId);
    return { message: 'Logged out from all devices successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout-others')
  async logoutOthers(
    @Request() req: RequestWithUser,
    @Body('refresh_token') refreshToken: string,
  ) {
    await this.authService.revokeOtherTokens(req.user.userId, refreshToken);
    return { message: 'Logged out from other devices successfully' };
  }
}
