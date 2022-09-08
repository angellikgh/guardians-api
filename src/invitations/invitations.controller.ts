import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedRequest } from '../auth/auth.interface';
import { AcceptInvitationDto } from './dto/acceptInvitation.dto';
import { CreateInvitationsDto } from './dto/createInvitations.dto';
import { InvitationsService } from './invitations.service';
import { Prisma } from '.prisma/client';
import { UserService } from '../users/user.service';
import { ROLE } from '../roles/roles.enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import {
  BatchInvitationResponse,
  InvitationBadRequestResponse,
  InvitationResponse,
  InvitationUnauthorizedResponse,
} from './entities/invitation.entity';
import { EmployeeService } from '../employees/employee.service';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(
    private invitationsService: InvitationsService,
    private readonly userService: UserService,
    private readonly employeeService: EmployeeService
  ) {}

  @Get()
  @Roles(ROLE.EMPLOYER_ADMIN)
  @UseGuards(AuthGuard('bearer'), RolesGuard)
  @ApiResponse({
    description: 'Get all employee invitations by logged-in employer',
    status: 200,
    type: InvitationResponse,
  })
  @ApiResponse({
    description: 'Bad request trying to get invitations',
    type: InvitationBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to get invitations with an unauthorized user',
    type: InvitationUnauthorizedResponse,
    status: 401,
  })
  @ApiResponse({
    description: 'Forbidden resource',
    status: 403,
  })
  async getAll(@Req() request: AuthenticatedRequest) {
    const { email } = request.user;
    const user = await this.userService.getOne({ email });
    const employerId = user?.employerId;

    if (!employerId) {
      throw new BadRequestException('User must be associated with an employer');
    }

    return await this.invitationsService.getAllByEmployerId(employerId);
  }

  @Post('batch')
  @Roles(ROLE.EMPLOYER_ADMIN)
  @UseGuards(AuthGuard('bearer'), RolesGuard)
  @ApiResponse({
    description: 'Batch operation to create multiple invitations',
    status: 201,
    type: BatchInvitationResponse,
  })
  @ApiResponse({
    description: 'Bad request trying to create batch invitations',
    type: InvitationBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to create batch invitations with an unauthorized user',
    type: InvitationUnauthorizedResponse,
    status: 401,
  })
  @ApiResponse({
    description: 'Forbidden resource',
    status: 403,
  })
  async createInvitations(
    @Req() request: AuthenticatedRequest,
    @Body() createInvitationsDto: CreateInvitationsDto
  ) {
    const { email } = request.user;
    const user = await this.userService.getOne({ email });
    const employerId = user?.employerId;
    if (!employerId) {
      throw new BadRequestException('User must be associated with an employer');
    }

    const { invitations } = createInvitationsDto;
    let internalEmployeeId: string | undefined = undefined;
    try {
      const isUserInternalAdmin = invitations.some(
        (item) => item.email.toLowerCase() === email.toLowerCase()
      );
      if (isUserInternalAdmin) {
        let internalAdminIndex = 0;
        invitations.forEach((value, index) => {
          if (value.email.toLowerCase() === email.toLowerCase()) {
            internalAdminIndex = index;
          }
        });
        const adminInvite = invitations[internalAdminIndex];
        const employeeCreateInput: Prisma.EmployeeCreateInput = {
          dateOfHire: adminInvite?.dateOfHire || '',
        };
        const results = await this.employeeService.create(employeeCreateInput);
        internalEmployeeId = results.id;
        await this.userService.update({ id: user?.id }, { employeeId: internalEmployeeId });
      }
      const inviteResults = await this.invitationsService.createMany(
        invitations.map((invitation) => ({ ...invitation, employerId }))
      );
      if (isUserInternalAdmin && user?.employerId) {
        await this.invitationsService.updateInternalAdminEmployeeId(
          {
            email_employerId: {
              employerId: user.employerId,
              email,
            },
          },
          { employeeId: internalEmployeeId }
        );
      }

      return inviteResults;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        const { code } = e;
        switch (code) {
          case 'P2002': {
            throw new BadRequestException('Emails must be unique per employer.');
          }
        }
      }

      throw new BadRequestException();
    }
  }

  @Post('/accept')
  @ApiResponse({
    description: 'Accept an invitation',
    status: 201,
    type: BatchInvitationResponse,
  })
  @ApiResponse({
    description: 'Bad request when invitation accepted',
    type: InvitationBadRequestResponse,
    status: 400,
  })
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    try {
      return await this.invitationsService.acceptInvitation(acceptInvitationDto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
