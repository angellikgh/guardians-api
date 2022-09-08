export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegistrationResponse {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: { [key: string]: string };
}

export interface UpdatePasswordRequest {
  password: string;
  oktaUserId: string;
}
