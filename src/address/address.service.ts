import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

import { UserService } from '../users/user.service';
import { EmployerService } from '../employers/employer.service';
import { getErrorMessage } from '../utils/getErrorMessage';

@Injectable()
export class AddressService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private employerService: EmployerService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AddressService.name);
  }
  async getOne(addressWhereUniqueInput: Prisma.AddressWhereUniqueInput) {
    return this.prisma.address.findUnique({
      where: addressWhereUniqueInput,
    });
  }

  async deleteAnAddress(addressId: string) {
    try {
      return this.prisma.address.delete({ where: { id: addressId } });
    } catch (error) {
      const errorMessage = `Error attempting to delete address: ${getErrorMessage(error)}`;
      this.logger.error(errorMessage);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async getOneByUserEmail(userEmail: string) {
    const user = await this.userService.getOne({ email: userEmail });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const addressId = user.addressId;
    if (!addressId) {
      return null;
    }
    return this.getOne({ id: addressId });
  }

  async getOneByDependentId(id: string) {
    const dependent = await this.userService.getOneDependentById(id);
    if (!dependent) {
      throw new NotFoundException('dependent not found');
    }
    const addressId = dependent.addressId;
    if (!addressId) {
      return null;
    }
    return this.getOne({ id: addressId });
  }

  async create(addressCreateInput: Prisma.AddressCreateInput) {
    return this.prisma.address.create({
      data: addressCreateInput,
    });
  }

  async createByEmail(addressCreateInput: Prisma.AddressCreateInput, userEmail: string) {
    const newAddress = await this.prisma.address.create({
      data: addressCreateInput,
    });
    const addressId = newAddress.id;
    return this.prisma.user.update({
      where: { email: userEmail },
      data: { addressId },
    });
  }

  async update(id: string, input: Prisma.EmployerUpdateInput) {
    return this.prisma.address.update({
      where: { id },
      data: input,
    });
  }

  async updateByEmail(addressCreateInput: Prisma.AddressCreateInput, userEmail: string) {
    const user = await this.userService.getOne({ email: userEmail });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const addressId = user.addressId;
    if (!addressId) {
      // create new address if no address exists
      const newAddress = await this.create(addressCreateInput);
      return this.userService.update({ id: user.id }, { addressId: newAddress.id });
    } else {
      // update existing address
      return this.update(addressId, addressCreateInput);
    }
  }

  async deleteUnusedAddressByAddressId(addressId: string) {
    const userAddressResults = await this.userService.findAllUsersWithAnAddressId(addressId);
    const employersAddressResults = await this.employerService.findAllEmployersWithAnAddressId(
      addressId
    );

    const totalAddressResults = employersAddressResults.length + userAddressResults.length;

    if (totalAddressResults === 0) {
      return this.deleteAnAddress(addressId);
    } else {
      return `Address associated with ${userAddressResults.length} other users`;
    }
  }

  async deleteUnusedAddressByUser(userEmail: string) {
    const user = await this.userService.getOne({ email: userEmail });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.addressId) {
      throw new NotFoundException('Address not found');
    }
    return this.deleteUnusedAddressByAddressId(user.addressId);
  }
}
