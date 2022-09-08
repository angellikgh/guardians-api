import { IsEmail } from 'class-validator';

export class CheckEmailDto {
  @IsEmail()
  readonly email: string;
}
