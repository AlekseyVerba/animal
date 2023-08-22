import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmpty, IsOptional } from 'class-validator';
import { IsUserExist } from 'src/validations/userExists.validation';

export class DeleteDialogDTO {
  @ApiProperty({
    name: 'partnerUid',
    type: String,
    description: 'Uid пользователя',
    required: true,
  })
  @IsUserExist()
  partnerUid: string;

  @IsEmpty()
  uid: string;
}
