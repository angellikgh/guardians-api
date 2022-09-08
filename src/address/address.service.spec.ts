import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModuleOptions } from '@nestjs/passport';

import { PrismaService } from '../prisma.service';
import { UserModule } from '../users/user.module';
import { AddressService } from './address.service';
import { EmployerService } from '../employers/employer.service';
import { QuotesService } from '../quotes/quotes.service';

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, ConfigModule.forRoot({ isGlobal: true }), LoggerModule.forRoot()],
      providers: [AuthModuleOptions, AddressService, PrismaService, EmployerService, QuotesService],
    }).compile();

    service = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
