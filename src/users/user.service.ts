import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { OktaService } from '../auth/okta.service';
import { PrismaService } from '../prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { UserWithMeta } from './interfaces/types';

import { EmailVerificationTokensService } from '../emailVerificationTokens/emailVerificationTokens.service';
import { PasswordResetTokensService } from '../passwordResetTokens/passwordResetTokens.service';
import { getErrorMessage } from '../utils/getErrorMessage';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailVerificationTokenService: EmailVerificationTokensService,
    private readonly passwordResetTokensService: PasswordResetTokensService,
    private readonly oktaService: OktaService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UserService.name);
  }

  private mapUserRole<T extends { roles: Role[] }>(user: T | null) {
    if (!user) {
      return user;
    }

    const { roles, ...rest } = user;

    return {
      ...rest,
      roles: roles.map((role) => role.name),
    };
  }

  async getOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        employer: {
          include: {
            invitations: true,
          },
        },
        address: true,
        roles: true,
        dependents: {
          include: {
            address: true,
          },
        },
        employee: {
          include: {
            benefits: {
              include: {
                rate: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return user;
    }

    const { dependents, ...rest } = user;

    const userWithSortedDependents = {
      ...rest,
      dependents: dependents.sort((a, b) => Number(a.createdAt) - Number(b.createdAt)),
    };

    return this.mapUserRole(userWithSortedDependents);
  }

  async getAll() {
    const users = await this.prisma.user.findMany({
      include: {
        employer: {
          include: {
            invitations: true,
          },
        },
        address: true,
        roles: true,
        dependents: {
          include: {
            address: true,
          },
        },
        employee: {
          include: {
            benefits: {
              include: {
                rate: true,
              },
            },
          },
        },
      },
    });

    if (!users.length) return users;

    return users.map((user) => this.mapUserRole(user));
  }

  private async createUserOktaAccount(
    input:
      | Omit<Prisma.UserCreateInput, 'oktaUserId'>
      | Omit<Prisma.UserUncheckedCreateInput, 'oktaUserId'>,
    password: string
  ): Promise<string | null> {
    const { email, firstName, lastName } = input;
    if (!firstName || !lastName || !password) return null;
    const { id: oktaUserId } = await this.oktaService.registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    return oktaUserId;
  }

  private async createUserWithOkta(
    input:
      | Omit<Prisma.UserCreateInput, 'oktaUserId'>
      | Omit<Prisma.UserUncheckedCreateInput, 'oktaUserId'>,
    password: string
  ) {
    const oktaUserId = await this.createUserOktaAccount(input, password);

    if (!oktaUserId) {
      throw new ServiceUnavailableException(
        'The account authentication service is not available at the moment.'
      );
    }

    return await this.prisma.user.create({
      data: { ...input, oktaUserId },
      include: {
        employer: true,
        address: true,
        roles: true,
        dependents: true,
        employee: true,
      },
    });
  }

  private async updateUserWithOkta(
    userId: string,
    input:
      | Omit<Prisma.UserCreateInput, 'oktaUserId'>
      | Omit<Prisma.UserUncheckedCreateInput, 'oktaUserId'>,
    password: string
  ) {
    const oktaId = await this.createUserOktaAccount(input, password);
    if (oktaId) {
      const updatedUser = await this.update(
        { id: userId },
        {
          oktaUserId: oktaId,
          eConsent: input.eConsent,
          firstName: input.firstName,
          lastName: input.lastName,
        }
      );
      return updatedUser;
    } else {
      throw new ServiceUnavailableException(
        'The account authentication service is not available at the moment.'
      );
    }
  }

  async create(
    input:
      | Omit<Prisma.UserCreateInput, 'oktaUserId'>
      | Omit<Prisma.UserUncheckedCreateInput, 'oktaUserId'>,
    options: {
      password: string | null;
      sendVerificationEmail: boolean;
    }
  ) {
    const { email, firstName, lastName, eConsent } = input;
    const { password, sendVerificationEmail } = options;
    const user = await this.getOne({ email });
    let signedUpForNotifications = false;

    if (user && user.oktaUserId === null) {
      signedUpForNotifications = true;
    } else if (user) {
      throw new Error(`User already exists with email: ${input.email}`);
    }

    try {
      const canCreateOktaAccount = firstName && lastName && email && password && eConsent;
      let newUser: UserWithMeta | null = null;
      if (user && signedUpForNotifications && canCreateOktaAccount && password) {
        const updatedUser = await this.updateUserWithOkta(user.id, input, password);
        if (updatedUser) {
          if (sendVerificationEmail)
            await this.emailVerificationTokenService.create({ user: updatedUser });
          return updatedUser;
        }
      } else if (canCreateOktaAccount && password) {
        newUser = await this.createUserWithOkta(input, password);
      } else {
        newUser = await this.prisma.user.create({
          data: { ...input },
          include: {
            employer: true,
            address: true,
            roles: true,
            dependents: true,
            employee: true,
          },
        });
      }
      if (!newUser)
        throw new ServiceUnavailableException(
          'The account authentication service is not available at the moment.'
        );
      if (sendVerificationEmail) {
        await this.emailVerificationTokenService.create({ user: newUser });
      }
      return this.mapUserRole(newUser);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new ServiceUnavailableException(`Unable to create account: ${errorMessage}`);
    }
  }

  async update(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    userUpdateInput: Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput
  ) {
    const user = await this.prisma.user.update({
      where: userWhereUniqueInput,
      data: userUpdateInput,
      include: {
        employer: true,
        address: true,
        roles: true,
        dependents: true,
        employee: true,
      },
    });

    return this.mapUserRole(user);
  }

  async canUpdate(email: string, userId: string) {
    const user = await this.getOne({ email });
    return user?.id === userId;
  }

  async validateUserEmail({ userId, tokenId }: { userId: string; tokenId: string }) {
    const validToken = await this.emailVerificationTokenService.isTokenValid({ userId, tokenId });

    if (!validToken) {
      return false;
    }

    await this.update(
      {
        id: userId,
      },
      {
        isEmailVerified: true,
        verifiedAt: new Date(),
      }
    );
    await this.emailVerificationTokenService.delete({ id: tokenId });

    return true;
  }

  async findAllUsersWithNoOktaAccount() {
    return this.prisma.user.findMany({
      where: {
        oktaUserId: null,
      },
    });
  }

  async resendUserValidation({ user }: { user: User }) {
    await this.emailVerificationTokenService.delete({ userId: user.id }).catch(() => {
      /* Legacy users may not have a token, ensure that no record exists for user */
    });
    await this.emailVerificationTokenService.create({ user });
  }

  async resendPasswordReset({ user }: { user: User }) {
    const token = await this.passwordResetTokensService.findOne({ userId: user.id });

    if (token) {
      await this.passwordResetTokensService.delete({ userId: user.id }).catch((e) => {
        this.logger.error(`Error in resendPasswordReset: ${e.stack}`);
      });
    } else {
      this.logger.info(`Unable to send password reset email: Token does not exist`);
    }

    await this.passwordResetTokensService.create({ user });
  }

  async validatePasswordToken({ userId, tokenId }: { userId: string; tokenId: string }) {
    const validToken = await this.passwordResetTokensService.isTokenValid({ userId, tokenId });

    if (!validToken) return false;

    return true;
  }

  async createDependent(dependentCreateInput: Prisma.DependentUncheckedCreateInput) {
    const newDependent = await this.prisma.dependent.create({
      data: dependentCreateInput,
    });

    const dependentId = newDependent.id;

    const dependentWithAddress = await this.prisma.dependent.findUnique({
      where: {
        id: dependentId,
      },
      include: {
        address: true,
      },
    });

    return dependentWithAddress;
  }

  async updateDependent(
    dependentId: string,
    dependentUpdateInput: Prisma.DependentUpdateInput | Prisma.DependentUncheckedUpdateInput
  ) {
    return await this.prisma.dependent.update({
      where: {
        id: dependentId,
      },
      data: dependentUpdateInput,
    });
  }

  async deleteDependent({ dependentId }: { dependentId: string }) {
    return await this.prisma.dependent.delete({
      where: {
        id: dependentId,
      },
    });
  }

  async findAllUsersWithAnAddressId(addressId: string) {
    return this.prisma.user.findMany({
      where: {
        addressId,
      },
    });
  }

  async findAllDependantsWithAnAddressId(addressId: string) {
    return this.prisma.dependent.findMany({
      where: {
        addressId,
      },
    });
  }

  async getOneDependentById(id: string) {
    return this.prisma.dependent.findUnique({
      where: {
        id,
      },
    });
  }
}
