import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Patch,
  Req,
  ServiceUnavailableException,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PasswordToken } from '@prisma/client';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

import { AuthenticatedRequest } from '../auth/auth.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { SendValidationEmailDto } from './dto/sendValidationEmail.dto';
import { ValidateUserDto } from './dto/validateUser.dto';
import { OktaService } from '../auth/okta.service';
import { UserService } from './user.service';
import {
  UserResponse,
  UsersResponse,
  UserBadRequestResponse,
  UserUnauthorizedResponse,
  UserErrorResponse,
  ConfirmEmailResponse,
} from './entities/user.entity';
import { UserCredentials } from '@okta/okta-sdk-nodejs';
import { CheckEmailDto } from './dto/checkEmail.dto';
import { PasswordResetTokensService } from '../passwordResetTokens/passwordResetTokens.service';
import { ROLE } from '../roles/roles.enum';
import { CreateDependentsDto } from './dto/createDependents.dto';
import { CreateDependentDto } from './dto/createDependent.dto';
import { CreateDependentsResponse, UpdateDependentResponse } from './entities/dependent.entity';
import { getErrorMessage } from '../utils/getErrorMessage';
import { AddressService } from '../address/address.service';
import { sleep } from '../utils/delay';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly oktaService: OktaService,
    private readonly passwordResetTokensService: PasswordResetTokensService,
    private readonly addressService: AddressService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(UserController.name);
  }

  @UseGuards(AuthGuard('admin-api-key'))
  @Get('/')
  @ApiResponse({ description: 'Get all registered users', type: UsersResponse, status: 200 })
  @ApiResponse({
    description: 'Not authorized to access this resource',
    type: UserUnauthorizedResponse,
    status: 401,
  })
  @ApiResponse({ description: 'Error retrieving users', type: UserErrorResponse, status: 404 })
  async getUsers() {
    const users = await this.userService.getAll();

    if (!users) {
      throw new NotFoundException('Users not found');
    }

    return users;
  }

  @Get('/me')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({ description: 'Get current logged in user', type: UserResponse, status: 200 })
  @ApiResponse({
    description: 'Not authorized to access this resource',
    type: UserUnauthorizedResponse,
    status: 401,
  })
  @ApiResponse({ description: 'Error retrieving user', type: UserErrorResponse, status: 404 })
  async getMe(@Req() request: AuthenticatedRequest) {
    const { email } = request.user;

    const user = await this.userService.getOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Post()
  @ApiResponse({ description: 'Create a new user', type: UserResponse, status: 201 })
  @ApiResponse({
    description: 'Bad request trying to create user',
    type: UserErrorResponse,
    status: 400,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const { firstName, lastName, email, eConsent, password } = createUserDto;
    let sendVerificationEmail = true;

    const isNotificationSignUpUser = !firstName && !lastName && !password && !eConsent && email;
    if (isNotificationSignUpUser) sendVerificationEmail = false;

    if (!eConsent && !isNotificationSignUpUser) {
      throw new BadRequestException(`eConsent must be true`);
    }

    try {
      const createdUser = await this.userService.create(
        {
          firstName,
          lastName,
          email,
          eConsent,
          roles: {
            connect: {
              name: ROLE.EMPLOYER_ADMIN,
            },
          },
        },
        { password, sendVerificationEmail }
      );

      if (!createdUser) {
        throw new ServiceUnavailableException(
          'The account creation service is not available at the moment.'
        );
      }

      return createdUser;
    } catch (error) {
      throw new BadRequestException(getErrorMessage(error));
    }
  }

  @Patch('/:id')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Update a user by id',
    type: UserResponse,
    status: 200,
  })
  @ApiResponse({
    description: 'Bad request trying to update a user',
    type: UserBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to update a user with an unauthorized user',
    type: UserUnauthorizedResponse,
    status: 401,
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest
  ) {
    const userCanUpdate = await this.userService.canUpdate(request.user.email, id);

    if (!userCanUpdate) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.getOne({ id });

    const updateUserObject = {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email: updateUserDto.email,
      gender: updateUserDto.gender,
      dateOfBirth: updateUserDto.dateOfBirth,
    };

    const addressObject = {
      addressLine1: updateUserDto.addressLine1,
      addressLine2: updateUserDto.addressLine2,
      city: updateUserDto.city,
      state: updateUserDto.state,
      zipCode: updateUserDto.zipCode,
    };

    return user?.addressId
      ? this.userService.update(
          { id },
          {
            ...updateUserObject,
            address: {
              update: {
                ...addressObject,
              },
            },
          }
        )
      : this.userService.update(
          { id },
          {
            ...updateUserObject,
            address: {
              create: {
                ...addressObject,
              },
            },
          }
        );
  }

  @Post('/forgot-password')
  @ApiResponse({ description: 'Check valid email', status: 201 })
  @ApiResponse({
    description: 'Bad request checking for valid email',
    type: UserErrorResponse,
    status: 400,
  })
  async checkEmail(@Body() checkEmailDto: CheckEmailDto) {
    const { email } = checkEmailDto;

    const user = await this.userService.getOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.resendPasswordReset({ user });
  }

  @Post(':id/reset-password')
  @ApiResponse({ description: 'Reset password', status: 200, type: UserCredentials })
  async findAndUpdate(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
    const { password, tokenId } = updatePasswordDto;
    const user = await this.userService.getOne({ id });
    const token: PasswordToken | null = await this.passwordResetTokensService.findOne({
      id: tokenId,
    });

    if (!user || !token) return false;
    const isValid = await this.userService.validatePasswordToken({ userId: id, tokenId });
    if (!isValid) return false;

    const oktaUserId = user?.oktaUserId;
    if (!oktaUserId) throw new BadRequestException('User does not have an Okta account');
    const userCredentials = await this.oktaService
      .updatePassword({ password, oktaUserId })
      .catch((e) => {
        this.logger.error(`Error updating password ${getErrorMessage(e)}`);
        return e;
      });

    if (userCredentials.password) {
      this.passwordResetTokensService.delete({ userId: user.id });
    }

    return userCredentials;
  }

  @Post('/confirm-email')
  @ApiResponse({ description: 'Validate user email', status: 201, type: ConfirmEmailResponse })
  @ApiResponse({
    description: 'Bad request trying to validate user email',
    type: UserErrorResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'User not found',
    type: UserErrorResponse,
    status: 404,
  })
  async validateUser(@Body() body: ValidateUserDto) {
    const { email, token } = body;
    const user = await this.userService.getOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { isEmailVerified } = user;
    if (isEmailVerified) {
      return { success: true };
    }

    const result = await this.userService.validateUserEmail({ userId: user.id, tokenId: token });

    return { success: result };
  }

  @Post('/send-email-confirmation')
  @ApiResponse({ description: 'Email confirmation sent successfully', status: 201 })
  @ApiResponse({
    description: 'Bad request trying to send email confirmation',
    type: UserErrorResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'User not found',
    type: UserErrorResponse,
    status: 404,
  })
  async sendValidationEmail(@Body() body: SendValidationEmailDto) {
    const { email } = body;
    const user = await this.userService.getOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { isEmailVerified } = user;
    if (isEmailVerified) {
      throw new BadRequestException('User is already validated');
    }

    await this.userService.resendUserValidation({ user });
  }

  @Post('/:id/dependents')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Dependents successfully created',
    type: CreateDependentsResponse,
    status: 201,
  })
  @ApiResponse({
    description: 'Bad request trying to create dependents',
    type: UserErrorResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to create dependents with an unauthorized user',
    type: UserUnauthorizedResponse,
    status: 401,
  })
  async createDependents(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() createDependentsDto: CreateDependentsDto
  ) {
    const userCanUpdate = await this.userService.canUpdate(request.user.email, id);

    if (!userCanUpdate) {
      throw new UnauthorizedException();
    }

    const { dependents } = createDependentsDto;

    const user = await this.userService.getOne({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const results = dependents.map(
      async (
        {
          relationshipToEmployee,
          dateOfBirth,
          firstName,
          lastName,
          gender,
          addressLine1,
          addressLine2,
          city,
          state,
          zipCode,
          isEligible,
        },
        index
      ) => {
        // If dependent request object contains address data, this indicates that the dependent DOES NOT have the same address as the employee
        // If no address data is provided in the request body this indicates that the dependent DOES have the same address as the employee
        // In this controller, we use addressLine1 to check if address data was provided in the dependent request object
        // A hotfix will be created in the future to make this action more clear
        let addressId = user.addressId;
        if (addressLine1) {
          const newAddress = await this.addressService.create({
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
          });
          addressId = newAddress.id;
        }

        if (!addressId || typeof addressId !== 'string') {
          throw new NotFoundException('Unable to establish dependent address');
        }

        const dependentData = {
          relationshipToEmployee,
          dateOfBirth,
          firstName,
          lastName,
          gender,
          addressId,
          isEligible,
        };

        // Delays dependent creation so that each dependent has unique createdAt value for consistent ordering on FE
        await sleep(index * 250);

        return this.userService.createDependent({
          ...dependentData,
          addressId,
          userId: user.id,
        });
      }
    );

    return Promise.all(results).then((data) => data);
  }

  @Patch('/:id/dependents/:dependentId')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Dependent successfully updated',
    type: UpdateDependentResponse,
    status: 201,
  })
  @ApiResponse({
    description: 'Bad request trying to update dependent',
    type: UserErrorResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to update a dependent as an unauthorized user',
    type: UserUnauthorizedResponse,
    status: 401,
  })
  async updateDependent(
    @Param('id') id: string,
    @Param('dependentId') dependentId: string,
    @Req() request: AuthenticatedRequest,
    @Body() createDependentDto: CreateDependentDto
  ) {
    const { user } = request;

    const userCanUpdate = await this.userService.canUpdate(user.email, id);

    if (!userCanUpdate) {
      throw new UnauthorizedException();
    }

    const userAddress = await this.addressService.getOneByUserEmail(user.email);
    const dependantPreviousAddress = await this.addressService.getOneByDependentId(dependentId);

    // user's address is the default
    let newAddressId = userAddress && userAddress.id ? userAddress.id : undefined;
    let isUserAddress = true;

    // New address to update
    if (createDependentDto.addressLine1) {
      const newAddress = await this.addressService.create({
        addressLine1: createDependentDto.addressLine1,
        addressLine2: createDependentDto.addressLine2,
        city: createDependentDto.city,
        state: createDependentDto.state,
        zipCode: createDependentDto.zipCode,
      });
      newAddressId = newAddress.id;
      isUserAddress = false;
    }

    if (!newAddressId || typeof newAddressId !== 'string') {
      throw new NotFoundException('Unable to establish dependent address');
    }

    const { relationshipToEmployee, dateOfBirth, firstName, lastName, gender, isEligible } =
      createDependentDto;

    const dependent = await this.userService.updateDependent(dependentId, {
      relationshipToEmployee,
      dateOfBirth,
      firstName,
      lastName,
      gender,
      isEligible,
      addressId: newAddressId,
    });

    if (
      dependantPreviousAddress &&
      newAddressId !== dependantPreviousAddress.id &&
      !isUserAddress
    ) {
      await this.addressService.deleteUnusedAddressByAddressId(dependantPreviousAddress.id);
    }

    return dependent;
  }

  @Delete('/:id/dependents/:dependentId')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Dependent successfully deleted',
    status: 200,
  })
  @ApiResponse({
    description: 'Bad Request trying to delete a dependent',
    status: 400,
  })
  @ApiResponse({
    description: 'Attempting to delete dependent as an unauthorized user',
    type: UserUnauthorizedResponse,
    status: 401,
  })
  async deleteDependent(
    @Param('id') id: string,
    @Param('dependentId') dependentId: string,
    @Req() request: AuthenticatedRequest
  ) {
    const { user } = request;

    const userCanUpdate = await this.userService.canUpdate(user.email, id);

    if (!userCanUpdate) {
      throw new UnauthorizedException();
    }
    return await this.userService.deleteDependent({ dependentId });
  }
}
