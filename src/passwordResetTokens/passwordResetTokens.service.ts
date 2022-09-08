import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { PasswordToken, Prisma, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { renderMjml } from '../email-templates/emails-utils';
import emails from '../email-templates/emails';
import {
  PasswordResetMessage,
  PasswordResetMessageSubject,
} from '../email-templates/PasswordResetMessage';
import EnvURLHelper from '../utils/EnvURLHelper';

@Injectable()
export class PasswordResetTokensService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  async findOne(
    passwordTokenWhereUniqueInput: Prisma.PasswordTokenWhereUniqueInput
  ): Promise<PasswordToken | null> {
    return await this.prismaService.passwordToken.findUnique({
      where: passwordTokenWhereUniqueInput,
      include: {
        user: true,
      },
    });
  }

  async create(passwordTokenCreateInput: { user: User }) {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const { email, id, firstName } = passwordTokenCreateInput.user;

    const result = await this.prismaService.passwordToken.create({
      data: {
        expiresAt: date,
        user: {
          connect: {
            id,
          },
        },
      },
    });

    const token = result.id;

    const passwordResetUrl = `${EnvURLHelper.getFEBaseURL()}/account/reset/${id}/${token}`;

    const passwordResetMessage = renderMjml(
      PasswordResetMessage({
        firstName: firstName ?? '',
        href: passwordResetUrl,
      })
    );
    const isProduction = this.configService.get('PUBLIC_ENVIRONMENT') === 'production';
    const sentFrom = isProduction ? emails.support : emails.testFrom;

    this.emailService.sendEmail(
      {
        message:
          'We received a request to reset your password. This password reset link is only valid for 24 hours',
        sendTo: email,
        sentFrom,
        html: passwordResetMessage,
        subject: PasswordResetMessageSubject,
      },
      []
    );
  }

  async delete(whereUniqueInput: Prisma.PasswordTokenWhereUniqueInput): Promise<PasswordToken> {
    return await this.prismaService.passwordToken.delete({
      where: whereUniqueInput,
    });
  }

  async isTokenValid({ userId, tokenId }: { userId: string; tokenId: string }) {
    const token = await this.findOne({ userId });

    return token && token.id === tokenId && moment(token.expiresAt).diff(new Date()) >= 0;
  }
}
