import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { getErrorMessage } from '../utils/getErrorMessage';
import { AuthService } from './auth.service';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: string) {
    try {
      const jwt = await this.authService.validateToken(token);
      return { email: jwt.claims.sub }; //Attached to request in a 'user' object
    } catch (error) {
      throw new UnauthorizedException(
        `The auth token is not valid, error: ${getErrorMessage(error)}`
      );
    }
  }
}
