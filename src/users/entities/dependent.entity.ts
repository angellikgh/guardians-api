import { Dependent as IDependent } from '@prisma/client';

export class Dependent implements IDependent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  relationshipToEmployee: string;
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  gender: string;
  isEligible: boolean;
  addressId: string;
  userId: string;
}

export class CreateDependentsResponse {
  data: Dependent[];
}

export class UpdateDependentResponse {
  data: Dependent;
}
