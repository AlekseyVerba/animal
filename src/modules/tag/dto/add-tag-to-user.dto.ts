import { IsEmpty } from 'class-validator';
import { TagExists } from 'src/validations/tagExists.validation';

export class AddTagToUserDto {
  @IsEmpty()
  uid: string;
  @TagExists({ message: 'Current tag does not exist' })
  tag_id: number;
}
