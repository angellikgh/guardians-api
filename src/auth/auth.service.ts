import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OktaJwtVerifier from '@okta/jwt-verifier';

@Injectable()
export class AuthService {
  private oktaVerifier: OktaJwtVerifier;
  private audience: string;

  constructor(private readonly configService: ConfigService) {
    const OKTA_DOMAIN = this.configService.get<string>('OKTA_DOMAIN');
    const OKTA_CLIENTID = this.configService.get<string>('OKTA_CLIENTID');
    const OKTA_AUDIENCE = this.configService.get<string>('OKTA_AUDIENCE');

    this.oktaVerifier = new OktaJwtVerifier({
      issuer: `${OKTA_DOMAIN}/oauth2/default`,
      clientId: OKTA_CLIENTID,
    });

    this.audience = OKTA_AUDIENCE || '';
  }

  async validateToken(token: string): Promise<OktaJwtVerifier.Jwt> {
    return await this.oktaVerifier.verifyAccessToken(token, this.audience);
  }
}
