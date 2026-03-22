import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggerInterceptor } from './interceptors/logger.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new LoggerInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const portNumber = Number(port);
  await app.listen(!Number.isNaN(portNumber) ? portNumber : 3000);
}
bootstrap();
