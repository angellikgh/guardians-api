import { IsNotEmpty, IsString, IsEnum, IsOptional, IsPostalCode, IsBoolean } from 'class-validator';
import { State } from '../../utils/state.interface';
import { Gender, Relationship } from '../interfaces/traits.interface';

export class CreateDependentDto {
  @IsEnum(Relationship)
  @IsNotEmpty()
  readonly relationshipToEmployee: Relationship;

  @IsString()
  @IsNotEmpty()
  readonly dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  readonly gender: Gender;

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

  @IsBoolean()
  @IsOptional()
  readonly isEligible: boolean;
}
