import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const rawResponse = exception.getResponse();

      let message: string | string[];
      let error = exception.name;

      if (typeof rawResponse === 'string') {
        message = rawResponse;
      } else if (typeof rawResponse === 'object' && rawResponse !== null) {
        const body = rawResponse as Record<string, unknown>;
        const rawMessage = body.message;
        const rawError = body.error;
        if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else if (
          Array.isArray(rawMessage) &&
          rawMessage.every((item) => typeof item === 'string')
        ) {
          message = rawMessage;
        } else {
          message = exception.message;
        }

        if (typeof rawError === 'string') {
          error = rawError;
        } else {
          error = exception.name;
        }
      } else {
        message = exception.message;
        error = exception.name;
      }

      response.status(status).json({
        error,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(status).json({
        error: 'Internal Server Error',
        message: 'Internal server error',
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
