import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { IsOnlyDate } from '../../utils/validators';

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsOnlyDate()
  @IsNotEmpty()
  readonly dateOfHire: string;

  @IsNumber()
  @IsNotEmpty()
  readonly hoursWorkedPerWeek: number;
}
