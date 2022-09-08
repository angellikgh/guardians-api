import { IsString, IsEmail, IsNotEmpty, IsBoolean, ValidateIf } from 'class-validator';

export class CreateUserDto {
  @IsBoolean()
  readonly eConsent: boolean;

  @IsString()
  @ValidateIf((_object, value) => value)
  readonly firstName: string | null;

  @IsString()
  @ValidateIf((_object, value) => value)
  readonly lastName: string | null;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @ValidateIf((_object, value) => value)
  readonly password: string | null;
}
