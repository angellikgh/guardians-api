import { Address as IAddress } from '@prisma/client';

export class Address implements IAddress {
  id: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  updatedAt: Date;
  createdAt: Date;
}

export class AddressResponse {
  data: Address | null;
}

export class AddressUnauthorizedResponse {
  statusCode: number;
  message: string;
}

export class AddressBadRequestResponse {
  input: string;
  message: string[];
  status: string;
}
