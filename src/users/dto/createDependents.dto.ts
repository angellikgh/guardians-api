import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateDependentDto } from './createDependent.dto';

export class CreateDependentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDependentDto)
  readonly dependents: CreateDependentDto[];
}
