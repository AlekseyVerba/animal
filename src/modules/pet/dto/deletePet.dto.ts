import { IsEmpty } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';

export class DeletePetDto {
  @IsPetExist({ message: "Питомец с id '$value' не существует" })
  pet_id: number;

  @IsEmpty()
  user_uid: string;
}
