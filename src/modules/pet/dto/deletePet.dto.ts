import { IsEmpty } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';

export class DeletePetDto {
  @IsPetExist({ message: "Pet with id '$value' does not exist!" })
  pet_id: number;

  @IsEmpty()
  user_uid: string;
}
