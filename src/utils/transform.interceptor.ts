import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const IgnoredPropertyName = Symbol('IgnoredPropertyName');

export function IgnoreTransformInterceptor() {
  return function (_target: Controller, _propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value[IgnoredPropertyName] = true;
  };
}

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isIgnored = (context.getHandler() as any)[IgnoredPropertyName];
    if (isIgnored) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => ({ data })));
  }
}
