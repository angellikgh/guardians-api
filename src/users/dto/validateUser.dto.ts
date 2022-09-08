import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
