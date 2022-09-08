import { Injectable } from '@nestjs/common';
import { Client as OktaClient, UserCredentials } from '@okta/okta-sdk-nodejs';
import { RegisterData, RegistrationResponse, UpdatePasswordRequest } from './auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OktaService {
  private oktaClient: OktaClient;

  constructor(private readonly configService: ConfigService) {
    const OKTA_APP_TOKEN = this.configService.get('OKTA_APP_TOKEN');
    const OKTA_DOMAIN = this.configService.get('OKTA_DOMAIN');

    this.oktaClient = new OktaClient({
      orgUrl: OKTA_DOMAIN,
      token: OKTA_APP_TOKEN,
    });
  }

  async registerUser(registerData: RegisterData): Promise<RegistrationResponse> {
    const OKTA_GROUP_USER = this.configService.get('OKTA_GROUP_USER');
    const { email, firstName, lastName, password } = registerData;
    const createdUser = await this.oktaClient.createUser({
      profile: { email, login: email, firstName, lastName },
      credentials: { password: { value: password } },
      groupIds: [OKTA_GROUP_USER],
    });
    return createdUser;
  }

  async updatePassword(
    updatePasswordRequest: UpdatePasswordRequest
  ): Promise<UserCredentials | null> {
    const { oktaUserId, password } = updatePasswordRequest;

    const temporaryPassword = await this.oktaClient.expirePasswordAndGetTemporaryPassword(
      oktaUserId
    );

    const newUserCredentials = await this.oktaClient.changePassword(oktaUserId, {
      oldPassword: temporaryPassword.tempPassword,
      newPassword: password,
    });

    if (!newUserCredentials) return null;

    return newUserCredentials;
  }
}
