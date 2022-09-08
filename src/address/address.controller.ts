import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/createAddress.dto';
import { AuthenticatedRequest } from '../auth/auth.interface';
import {
  AddressBadRequestResponse,
  AddressResponse,
  AddressUnauthorizedResponse,
} from './entities/address.entity';

@ApiTags('addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('/my-address')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Get address of logged-in user',
    type: AddressResponse,
    status: 200,
  })
  @ApiResponse({
    description: 'Trying to get address info with an unauthorized user',
    type: AddressUnauthorizedResponse,
    status: 401,
  })
  async getMyAddress(@Req() request: AuthenticatedRequest) {
    const { email: userEmail } = request.user;
    return this.addressService.getOneByUserEmail(userEmail);
  }

  @Post('insert-user-address')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Create a new address must be associated with a logged-in user',
    type: AddressResponse,
    status: 201,
  })
  @ApiResponse({
    description: 'Bad Request while trying to create an address',
    type: AddressBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to create an address with an unauthorized user',
    type: AddressUnauthorizedResponse,
    status: 401,
  })
  async createUserAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Req() request: AuthenticatedRequest
  ) {
    const { email: userEmail } = request.user;
    const createdAddress = await this.addressService.createByEmail(createAddressDto, userEmail);
    if (!createdAddress) {
      throw new ServiceUnavailableException(
        'Address creation service is unavailable at the moment.'
      );
    }
    return createdAddress;
  }

  @Post()
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Create a new address must be associated with a logged-in user',
    type: AddressResponse,
    status: 201,
  })
  @ApiResponse({
    description: 'Bad Request while trying to create an address',
    type: AddressBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to create an address with an unauthorized user',
    type: AddressUnauthorizedResponse,
    status: 401,
  })
  async createAddress(@Body() createAddressDto: CreateAddressDto) {
    const createdAddress = await this.addressService.create(createAddressDto);
    if (!createdAddress) {
      throw new ServiceUnavailableException(
        'Address creation service is unavailable at the moment.'
      );
    }
    return createdAddress;
  }

  @Post('update-user-address')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Update an address must be associated with a logged-in user',
    type: AddressResponse,
    status: 201,
  })
  @ApiResponse({
    description: 'Bad Request while trying to create an address',
    type: AddressBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to create an address with an unauthorized user',
    type: AddressUnauthorizedResponse,
    status: 401,
  })
  async updateUserAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Req() request: AuthenticatedRequest
  ) {
    const { email: userEmail } = request.user;
    const createdAddress = await this.addressService.updateByEmail(createAddressDto, userEmail);
    if (!createdAddress) {
      throw new ServiceUnavailableException(
        'Address creation service is unavailable at the moment.'
      );
    }
    return createdAddress;
  }

  @Get('delete-unused-user-address')
  @UseGuards(AuthGuard('bearer'))
  @ApiResponse({
    description: 'Delete an address associated with a logged-in user if not in usage',
    type: AddressResponse,
    status: 201,
  })
  @ApiResponse({
    description: 'Bad Request while trying to delete an address',
    type: AddressBadRequestResponse,
    status: 400,
  })
  @ApiResponse({
    description: 'Trying to delete an address with an unauthorized user',
    type: AddressUnauthorizedResponse,
    status: 401,
  })
  async deleteUserUnusedAddress(@Req() request: AuthenticatedRequest) {
    const { email: userEmail } = request.user;
    const createdAddress = await this.addressService.deleteUnusedAddressByUser(userEmail);
    if (!createdAddress) {
      throw new ServiceUnavailableException('Address delete service is unavailable at the moment.');
    }
    return createdAddress;
  }
}
