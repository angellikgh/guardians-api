import { Prisma } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { PrismaService } from '../prisma.service';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Invitation } from './entities/invitation.entity';
import { UserService } from '../users/user.service';
import { ROLE } from '../roles/roles.enum';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
    private readonly userService: UserService
  ) {
    this.logger.setContext(InvitationsService.name);
  }

  async getOne(where: Prisma.InvitationWhereUniqueInput) {
    return await this.prisma.invitation.findUnique({
      where,
    });
  }
  async getAllByEmployerId(employerId: string) {
    return await this.prisma.invitation.findMany({ where: { employerId } });
  }

  async createMany(input: Prisma.InvitationCreateManyInput[]) {
    return await this.prisma.invitation.createMany({ data: input });
  }

  async updateAllReportedIdsToCurrentDate(invitations: Invitation[]): Promise<string> {
    const emails = invitations.map((invitation) => {
      return invitation.email;
    });
    try {
      await this.prisma.invitation.updateMany({
        where: {
          email: { in: emails },
        },
        data: {
          reportedDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Error in invitations service, error: ${getErrorMessage(error)}`);
      return getErrorMessage(error);
    }
    return 'success';
  }

  async acceptInvitation(input: {
    eConsent: boolean;
    email: string;
    employerId: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const { password, employerId, ...rest } = input;

    try {
      const [invitation, user] = await Promise.all([
        await this.getOne({
          email_employerId: {
            employerId,
            email: rest.email,
          },
        }),
        await this.userService.getOne({
          email: rest.email,
        }),
      ]);

      if (!invitation) {
        throw new Error(`Unable to find invitation for ${rest.email}`);
      }

      if (user) {
        throw new Error(`Account has already been created for ${rest.email}`);
      }

      const newEmployee = await this.userService.create(
        {
          ...rest,
          isEmailVerified: true,
          verifiedAt: new Date(),
          employer: {
            connect: {
              id: employerId,
            },
          },
          employee: {
            create: {
              dateOfHire: invitation.dateOfHire,
            },
          },
          roles: {
            connect: {
              name: ROLE.EMPLOYEE,
            },
          },
        },
        { password, sendVerificationEmail: false }
      );

      await this.prisma.invitation.update({
        where: {
          email_employerId: {
            email: rest.email,
            employerId,
          },
        },
        data: {
          employeeId: newEmployee?.employeeId,
        },
      });

      return newEmployee;
    } catch (error) {
      this.logger.error(`Unknown error while accepting user: ${getErrorMessage(error)}`);
      throw new BadRequestException(error);
    }
  }
  async updateInternalAdminEmployeeId(
    where: Prisma.InvitationWhereUniqueInput,
    input: Prisma.InvitationWhereUniqueInput
  ) {
    return this.prisma.invitation.update({
      where,
      data: input,
      include: {
        employer: true,
      },
    });
  }
}
