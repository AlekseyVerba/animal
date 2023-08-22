import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty } from 'class-validator';
import { IsUserExist } from 'src/validations/userExists.validation';

export class ReadMessagesDTO {
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
