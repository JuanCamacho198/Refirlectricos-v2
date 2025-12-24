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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { AuthService } from '../auth/auth.service';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getHistory(@Request() req: RequestWithUser) {
    return this.usersService.getHistory(req.user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = req.user;

    // Solo ADMIN puede cambiar roles
    if (updateUserDto.role && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permisos para cambiar roles');
    }

    // Solo ADMIN o el propio usuario pueden editar
    if (user.userId !== id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No puedes editar este usuario');
    }

    const passwordChanged = !!updateUserDto.password;
    const updatedUser = await this.usersService.update(id, updateUserDto);

    // Revoke all refresh tokens if password was changed
    if (passwordChanged) {
      await this.authService.revokeRefreshTokens(id);
    }

    return updatedUser;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    // Revoke refresh tokens before deletion
    await this.authService.revokeRefreshTokens(id);
    return this.usersService.remove(id);
  }
}
