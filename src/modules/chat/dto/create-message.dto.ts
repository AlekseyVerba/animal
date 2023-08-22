import { IsEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsMessagerExist } from '../../../validations/messageExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsEmpty()
  uid: string;

  @ApiProperty({
    name: 'reply_id',
    type: Number,
    description: 'Ответ на сообщение. id сообщения',
    required: false,
  })
  @IsMessagerExist()
  @IsOptional()
  reply_id?: number;

  @ApiProperty({
    name: 'partner_uid',
    type: String,
    description: 'Кому отправляем сообщение',
    required: true,
  })
  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  partner_uid: string;

  @ApiProperty({
    name: 'value',
    type: String,
    description: 'Значение. Если отправляем файлы, то передаем ""',
    required: true,
  })
  @MaxLength(500, { message: 'Максимальная длина сообщения - 500' })
  @IsString()
  value: string;
}
