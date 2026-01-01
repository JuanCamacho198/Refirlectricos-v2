import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    // Admin users get longer sessions (24 hours) vs regular users (1 hour)
    const expiresIn = user.role === 'ADMIN' ? '24h' : '1h';

    // Generate access token
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    // Generate refresh token
    const refreshTokenPayload = { sub: user.id };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d', // Refresh token lasts 7 days
    });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      this.jwtService.verify(refreshToken);

      // Check if refresh token exists in database and is not expired
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = storedToken.user;

      // ROTATION: Delete the old refresh token (invalidate it)
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Generate new access token
      const accessPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };
      const expiresIn = user.role === 'ADMIN' ? '24h' : '1h';
      const newAccessToken = this.jwtService.sign(accessPayload, { expiresIn });

      // ROTATION: Generate new refresh token
      const newRefreshTokenPayload = { sub: user.id };
      const newRefreshToken = this.jwtService.sign(newRefreshTokenPayload, {
        expiresIn: '7d',
      });

      // Store new refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken, // Return new refresh token
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Limpia tokens expirados de la base de datos
   * Puede ser llamado periódicamente por un cron job
   */
  async cleanupExpiredTokens() {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return {
      deleted: deleted.count,
      message: `${deleted.count} expired tokens removed`,
    };
  }

  /**
   * Revoca todos los tokens de un usuario excepto el actual
   * Útil para "Cerrar sesión en otros dispositivos"
   */
  async revokeOtherTokens(userId: string, currentToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: {
          not: currentToken,
        },
      },
    });
  }
}
