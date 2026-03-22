import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const startDate = Date.now();
    console.log(`[START] ` + req.method + ' ' + req.url);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startDate;
        console.log(
          `[END] ` + req.method + ' ' + req.url + ' ' + duration + 'ms',
        );
      }),
    );
  }
}
