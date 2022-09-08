import { User as IUser, Address as IAddress } from '@prisma/client';
import { UserCredentials as IUserCredentials } from '@okta/okta-sdk-nodejs';

export class User implements IUser {
  id: string;
  addressId: string | null;
  createdAt: Date;
  eConsent: boolean;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
  employerId: string | null;
  employeeId: string | null;
  firstName: string | null;
  isEmailVerified: boolean;
  lastName: string | null;
  oktaUserId: string | null;
  updatedAt: Date;
  verifiedAt: Date | null;
  address?: Address | null;
}

export class Address implements IAddress {
  createdAt: Date;
  updatedAt: Date;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  id: string;
}

export class UserResponse {
  data: User;
}

export class UserBadRequestResponse {
  input: string;
  message: string[];
  status: string;
}

export class UserUnauthorizedResponse {
  statusCode: number;
  message: string[] | string;
}

export class UserErrorResponse extends UserUnauthorizedResponse {
  error: string;
}

export class ConfirmEmail {
  success: boolean;
}

export class ConfirmEmailResponse {
  data: ConfirmEmail;
}

// Intentionally implement IUserCredentials to make this available for swagger
export class UserCredentials implements IUserCredentials {
  password: {
    hash: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      algorithm: any;
      salt: string;
      saltOrder: string;
      value: string;
      workFactor: number;
    };
    hook: { type: string };
    value: string;
  };
  provider: {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: any;
  };
  recovery_question: { answer: string; question: string };
}

export class UserCredentialsResponse {
  data: UserCredentials | null;
}

export class UsersResponse {
  data: User[];
}
