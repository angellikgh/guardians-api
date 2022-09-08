import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { AuthModuleOptions } from '@nestjs/passport';

import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OktaService } from '../auth/okta.service';
import { EmailVerificationTokensModule } from '../emailVerificationTokens/emailVerificationTokens.module';
import { EmailModule } from '../email/email.module';
import { PasswordResetTokensModule } from '../passwordResetTokens/passwordResetTokens.module';
import { EmailVerificationTokensService } from '../emailVerificationTokens/emailVerificationTokens.service';
import { AddressService } from '../address/address.service';
import { EmployerService } from '../employers/employer.service';
import { QuotesService } from '../quotes/quotes.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EmailVerificationTokensModule,
        PasswordResetTokensModule,
        EmailModule,
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot(),
      ],
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
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
