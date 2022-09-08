import { User, Role, Employee, Employer, Address, Dependent } from '@prisma/client';

export type UserWithMeta = User & {
  employee: Employee | null;
  employer: Employer | null;
  address: Address | null;
  dependents: Dependent[];
  roles: Role[];
};
