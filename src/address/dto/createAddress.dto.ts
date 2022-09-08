import { IsOptional, IsEnum, IsPostalCode } from 'class-validator';
import { IsOnlyDate } from '../../utils/validators';
import { State } from '../../utils/state.interface';

export class CreateAddressDto {
  @IsOptional()
  addressLine1?: string | null;

  @IsOptional()
  addressLine2?: string | null;

  @IsOptional()
  city: string | null;

  @IsEnum(State)
  @IsOptional()
  state: State;

  @IsPostalCode('US')
  @IsOptional()
  zipCode: string | null;

  @IsOptional()
  @IsOnlyDate()
  updatedAt: Date;

  @IsOptional()
  @IsOnlyDate()
  createdAt: Date;
}
