import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = req;
    const userAgent = headers['user-agent'];

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          if (duration > 1000) {
            this.logger.warn(
              `SLOW [${method}] ${url} - ${duration}ms | user=${user?.id ?? 'anonymous'} | ip=${ip}`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - start;
          this.logger.error(
            `ERROR [${method}] ${url} - ${duration}ms | user=${user?.id ?? 'anonymous'} | ip=${ip} | ${error.message}`,
          );
        },
      }),
    );
  }
}
