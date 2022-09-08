import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { EmailModule } from '../email/email.module';
import { PasswordResetTokensService } from './passwordResetTokens.service';

@Module({
  imports: [EmailModule],
  providers: [PrismaService, PasswordResetTokensService],
  exports: [PasswordResetTokensService],
})
export class PasswordResetTokensModule {}
