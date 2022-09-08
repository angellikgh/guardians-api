import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateInvitationDto } from './createInvitation.dto';

export class CreateInvitationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvitationDto)
  readonly invitations: CreateInvitationDto[];
}
