import { Module } from '@nestjs/common';
import { AuthModuleOptions } from '@nestjs/passport';

import { GuardianModule } from '../guardian/guardian.module';
import { HelloSignController } from './hellosign.controller';
import { HelloSignService } from './hellosign.service';
import { QuotesSubmissionHistoryModule } from '../quotesSubmissionHistory/quotesSubmissionHistory.module';
import { QuotesSubmissionHistoryService } from '../quotesSubmissionHistory/quotesSubmissionHistory.service';
import { PrismaService } from '../prisma.service';
import { RatesService } from '../rates/rates.service';
import { QuotesModule } from '../quotes/quotes.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [QuotesModule, GuardianModule, DocumentsModule, QuotesSubmissionHistoryModule],
  controllers: [HelloSignController],
  providers: [
    PrismaService,
    AuthModuleOptions,
    HelloSignService,
    QuotesSubmissionHistoryService,
    RatesService,
  ],
  exports: [HelloSignService],
})
export class HelloSignModule {}
