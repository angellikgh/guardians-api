import { IsString, IsNotEmpty } from 'class-validator';

export class SendValidationEmailDto {
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}
