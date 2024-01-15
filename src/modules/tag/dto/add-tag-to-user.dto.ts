import { IsEmpty } from 'class-validator';
import { TagExists } from 'src/validations/tagExists.validation';

export class AddTagToUserDto {
  @IsEmpty()
  uid: string;
  @TagExists({ message: 'Текущий тэг не существует' })
  tag_id: number;
}
