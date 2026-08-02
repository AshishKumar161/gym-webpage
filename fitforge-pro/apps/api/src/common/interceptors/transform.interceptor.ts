import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already formatted (has success field), pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle paginated responses
        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          return {
            success: true,
            ...data,
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          };
        }

        return {
          success: true,
          data: data?.data ?? data,
          message: data?.message,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        };
      }),
    );
  }
}
