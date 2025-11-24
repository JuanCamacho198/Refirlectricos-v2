import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  // Configuración de Winston
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          // En producción usamos JSON, en desarrollo usamos formato legible con colores
          process.env.NODE_ENV === 'production'
            ? winston.format.json()
            : winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(
                  ({ timestamp, level, message, context, ms }) => {
                    return `${timestamp as string} [${
                      (context as string) || 'Application'
                    }] ${level}: ${message as string} ${ms as string}`;
                  },
                ),
              ),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: logger,
  });
  // Security Headers
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Habilitar CORS para permitir peticiones desde el Frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Asegúrate de tener FRONTEND_URL en Render o usa '*' temporalmente
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Refrielectricos API')
    .setDescription('API para el eCommerce de Refrielectricos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
