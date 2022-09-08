import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { PasswordResetTokensModule } from '../passwordResetTokens/passwordResetTokens.module';
import { EmailModule } from '../email/email.module';
import { EmailVerificationTokensModule } from '../emailVerificationTokens/emailVerificationTokens.module';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { OktaService } from '../auth/okta.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EmailVerificationTokensModule,
        PasswordResetTokensModule,
        EmailModule,
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot(),
      ],
      providers: [UserService, PrismaService, OktaService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
