import { Invitation as IInvitation, InvitationStatus } from '@prisma/client';

export class Invitation implements IInvitation {
  firstName: string;
  lastName: string;
  email: string;
  dateOfHire: string;
  hoursWorkedPerWeek: number;
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
  employerId: string;
  employeeId: string | null;
  reportedDate: string | null;
}

export class BatchInvitation {
  count: number;
}

export class InvitationResponse {
  data: Invitation[];
}

export class BatchInvitationResponse {
  data: BatchInvitation;
}

export class InvitationUnauthorizedResponse {
  statusCode: number;
  message: string | string[];
}

export class InvitationBadRequestResponse extends InvitationUnauthorizedResponse {
  error: string;
}
