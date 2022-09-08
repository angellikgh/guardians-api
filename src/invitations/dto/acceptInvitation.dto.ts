import { Equals, IsBoolean, IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class AcceptInvitationDto {
  @IsBoolean()
  @Equals(true)
  readonly eConsent: boolean;

  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly employerId: string;
}
