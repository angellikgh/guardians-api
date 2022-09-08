import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { EmailVerificationToken, Prisma, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { EmailVerificationMessage } from '../email-templates/EmailVerificationMessage';
import { renderMjml } from '../email-templates/emails-utils';
import emails from '../email-templates/emails';
import EnvURLHelper from '../utils/EnvURLHelper';

@Injectable()
export class EmailVerificationTokensService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  async findOne(
    whereUniqueInput: Prisma.EmailVerificationTokenWhereUniqueInput
  ): Promise<EmailVerificationToken | null> {
    return await this.prismaService.emailVerificationToken.findUnique({
      where: whereUniqueInput,
    });
  }

  async create(createInput: { user: Pick<User, 'id' | 'email'> }): Promise<EmailVerificationToken> {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    const { email, id } = createInput.user;
    const result = await this.prismaService.emailVerificationToken.create({
      data: {
        expiresAt: date,
        user: {
          connect: {
            id,
          },
        },
      },
    });

    const verificationUrl = `${EnvURLHelper.getFEBaseURL()}/account/verification?${querystring.stringify(
      {
        email,
        token: result.id,
      }
    )}`;
    const emailMessage = renderMjml(EmailVerificationMessage({ href: verificationUrl }));
    const isProduction = this.configService.get('PUBLIC_ENVIRONMENT') === 'production';
    const sentFrom = isProduction ? emails.support : emails.testFrom;
    this.emailService.sendEmail({
      message: 'benworks Verification',
      html: emailMessage,
      sendTo: email,
      sentFrom,
      subject: 'benworks Verification',
    });

    return result;
  }

  async delete(
    whereUniqueInput: Prisma.EmailVerificationTokenWhereUniqueInput
  ): Promise<EmailVerificationToken> {
    return await this.prismaService.emailVerificationToken.delete({
      where: whereUniqueInput,
    });
  }

  async isTokenValid({ userId, tokenId }: { userId: string; tokenId: string }) {
    const token = await this.findOne({ userId });

    return token && token.id === tokenId && moment(token.expiresAt).diff(new Date()) >= 0;
  }
}
