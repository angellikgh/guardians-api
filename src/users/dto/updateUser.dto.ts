import { IsString, IsOptional, IsEmail, IsEnum, IsPostalCode } from 'class-validator';
import { Gender } from '../interfaces/traits.interface';
import { State } from '../../utils/state.interface';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly firstName: string;

  @IsString()
  @IsOptional()
  readonly lastName: string;

  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsEnum(Gender)
  @IsOptional()
  readonly gender: Gender;

  @IsString()
  @IsOptional()
  readonly dateOfBirth: string;

  @IsString()
  @IsOptional()
  readonly addressLine1: string;

  @IsString()
  @IsOptional()
  readonly addressLine2: string;

  @IsString()
  @IsOptional()
  readonly city: string;

  @IsEnum(State)
  @IsOptional()
  readonly state: State;

  @IsPostalCode('US')
  @IsOptional()
  readonly zipCode: string;
}
