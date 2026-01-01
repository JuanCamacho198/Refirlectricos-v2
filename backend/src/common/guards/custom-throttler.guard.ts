import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Sobrescribe el método para proporcionar mensajes de error personalizados
   */
  protected throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const route = String(request.route?.path ?? request.url);

    // Agregar headers cuando se excede el límite
    response.setHeader('Retry-After', '60');

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        error: 'ThrottlerException',
        details: `Rate limit exceeded for ${route}. Please try again later.`,
        retryAfter: 60, // segundos
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
