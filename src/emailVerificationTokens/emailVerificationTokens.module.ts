import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma.service';
import { EmailVerificationTokensService } from './emailVerificationTokens.service';

@Module({
  imports: [EmailModule],
  providers: [PrismaService, EmailVerificationTokensService],
  exports: [EmailVerificationTokensService],
})
export class EmailVerificationTokensModule {}
