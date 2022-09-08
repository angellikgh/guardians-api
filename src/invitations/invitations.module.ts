import { Module } from '@nestjs/common';

import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../users/user.module';
import { AuthModuleOptions } from '@nestjs/passport';
import { EmployeeService } from '../employees/employee.service';
import { QuotesService } from '../quotes/quotes.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [UserModule],
  providers: [
    AuthModuleOptions,
    InvitationsService,
    PrismaService,
    EmailService,
    QuotesService,
    EmployeeService,
  ],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
