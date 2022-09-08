import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import Strategy from 'passport-headerapikey';

@Injectable()
export class PasswordResetApiKeyStrategy extends PassportStrategy(
  Strategy,
  'password-reset-api-key'
) {
  constructor(private readonly configService: ConfigService) {
    super(
      { header: 'X-API-KEY', prefix: '' },
      true,
      async (apiKey: string, done: (err: Error | null, user?: Object, info?: Object) => void) => {
        return this.validate(apiKey, done);
      }
    );
  }

  public validate = (
    apiKey: string,
    done: (err: Error | null, user?: Object, info?: Object) => void
  ) => {
    if (this.configService.get<string>('PASSWORD_RESET_API_KEY') === apiKey) {
      done(null, true);
    }
    done(new UnauthorizedException());
  };
}
