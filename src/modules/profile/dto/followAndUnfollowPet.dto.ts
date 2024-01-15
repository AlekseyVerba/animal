import { IsEmpty } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';

export class FollowAndUnfollowPetDto {
  @IsPetExist({ message: "Питомец с id '$value' не существует" })
  pet_id: string;
  @IsEmpty()
  current_uid: string;
}
