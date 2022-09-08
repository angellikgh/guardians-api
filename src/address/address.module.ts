import { Module } from '@nestjs/common';

import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../users/user.module';
import { EmployerService } from '../employers/employer.service';
import { QuotesService } from '../quotes/quotes.service';
import { EmployerModule } from '../employers/employer.module';
import { AuthModuleOptions } from '@nestjs/passport';

@Module({
  imports: [UserModule, EmployerModule],
  controllers: [AddressController],
  providers: [AuthModuleOptions, AddressService, PrismaService, EmployerService, QuotesService],
  exports: [AddressService],
})
export class AddressModule {}
