import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';

import { HealthCheckModule } from '../healthCheck/healthCheck.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { EmployerModule } from '../employers/employer.module';
import { pinoConfig } from '../utils/logging';
import { QuotesModule } from '../quotes/quotes.module';
import { HelloSignModule } from '../hellosign/hellosign.module';
import { RatesModule } from '../rates/rates.module';
import { UserModule } from '../users/user.module';
import { join } from 'path';
import { ReportsModule } from '../reports/reports.module';
import { GuardianModule } from '../guardian/guardian.module';
import { DatesModule } from '../dates/dates.module';
import { InvitationsModule } from './../invitations/invitations.module';
import { EmailVerificationTokensModule } from '../emailVerificationTokens/emailVerificationTokens.module';
import { EmployeeModule } from '../employees/employee.module';
import { AddressModule } from '../address/address.module';
import { QuotesSubmissionHistoryModule } from '../quotesSubmissionHistory/quotesSubmissionHistory.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // public/index.html
      rootPath: join(__dirname, '../', 'public'),
    }),
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    LoggerModule.forRoot({ pinoHttp: pinoConfig }),
    HealthCheckModule,
    AuthModule,
    EmailModule,
    EmailVerificationTokensModule,
    EmployerModule,
    EmployeeModule,
    QuotesModule,
    HelloSignModule,
    RatesModule,
    UserModule,
    ReportsModule,
    GuardianModule,
    DatesModule,
    ReportsModule,
    InvitationsModule,
    AddressModule,
    QuotesSubmissionHistoryModule,
    DocumentsModule,
  ],
})
export class AppModule {}
