import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const startDate = Date.now();
    console.log(`[START] ` + req.method + ' ' + req.url);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startDate;
        console.log(
          `[SUCCESS] ` + req.method + ' ' + req.url + ' ' + duration + 'ms',
        );
      }),
      catchError((err) => {
        const duration = Date.now() - startDate;
        console.log(
          '[ERROR] ' + req.method + ' ' + req.url + ' ' + duration + 'ms',
        );
        return err;
      }),
    );
  }
}
