import { IsPetExist } from 'src/validations/petExists.validation';

export class GetProfilePetDto {
  @IsPetExist({ message: "Питомец с id '$value' не существует" })
  pet_id: number;
}
