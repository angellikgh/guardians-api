import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { OktaService } from '../auth/okta.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailVerificationTokensModule } from '../emailVerificationTokens/emailVerificationTokens.module';
import { PasswordResetTokensModule } from '../passwordResetTokens/passwordResetTokens.module';
import { AddressService } from '../address/address.service';
import { EmployerService } from '../employers/employer.service';
import { QuotesService } from '../quotes/quotes.service';
import { EmailVerificationTokensService } from '../emailVerificationTokens/emailVerificationTokens.service';
import { PinoLogger } from 'nestjs-pino';
import { AuthModuleOptions } from '@nestjs/passport';

@Module({
  imports: [PasswordResetTokensModule, EmailVerificationTokensModule, EmailModule],
  controllers: [UserController],
  providers: [
    AuthModuleOptions,
    PrismaService,
    EmailVerificationTokensService,
    UserService,
    OktaService,
    PinoLogger,
    AddressService,
    EmployerService,
    QuotesService,
  ],
  exports: [UserService],
})
export class UserModule {}
