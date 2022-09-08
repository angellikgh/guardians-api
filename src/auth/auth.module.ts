import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ReportsApiKeyStrategy } from './reportsApiKey.strategy';
import { PasswordResetApiKeyStrategy } from './passwordResetApiKey.strategy';
import { PushNotificationsApiKeyStrategy } from './pushNotificationsApiKey.strategy';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';
import { EmailsApiKeyStrategy } from './emailsApiKey.strategy';
import { AdminApiKeyStrategy } from './adminApiKey.strategy';

@Module({
  imports: [PassportModule],
  providers: [
    HttpStrategy,
    AuthService,
    EmailsApiKeyStrategy,
    ReportsApiKeyStrategy,
    PasswordResetApiKeyStrategy,
    PushNotificationsApiKeyStrategy,
    AdminApiKeyStrategy,
  ],
})
export class AuthModule {}
