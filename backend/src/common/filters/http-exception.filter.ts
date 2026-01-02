import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type {
  ErrorResponse,
  ValidationErrorDetail,
} from '../interfaces/error-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const isProduction = process.env.NODE_ENV === 'production';

    // Extract message and details from exception
    let message: string;
    let details: Record<string, any> | undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;

      // Handle validation errors from class-validator
      if (Array.isArray(responseObj.message)) {
        message = 'Validation failed';
        details = {
          validationErrors: this.formatValidationErrors(responseObj.message),
        };
      } else {
        message = responseObj.message || exception.message;

        // Include additional details if present
        if (responseObj.error) {
          details = { error: responseObj.error };
        }
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(details && { details }),
      ...(!isProduction && { stack: exception.stack }),
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(messages: string[]): ValidationErrorDetail[] {
    const errors: ValidationErrorDetail[] = [];

    for (const msg of messages) {
      // Try to parse validation error format
      const match = msg.match(/^(\w+)\s+(.+)$/);
      if (match) {
        const field = match[1];
        const constraint = match[2];

        const existing = errors.find((e) => e.field === field);
        if (existing) {
          existing.constraints.push(constraint);
        } else {
          errors.push({
            field,
            constraints: [constraint],
          });
        }
      } else {
        // If format doesn't match, add as generic error
        errors.push({
          field: 'general',
          constraints: [msg],
        });
      }
    }

    return errors;
  }
}
