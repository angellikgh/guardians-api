import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'CACHE_OPTIONS',
      useValue: {
        ttl: 100000,
      },
    },
  ],
  exports: ['CACHE_OPTIONS'],
})
export class CacheConfigModule {}
