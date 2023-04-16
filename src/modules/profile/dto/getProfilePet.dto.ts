import { IsPetExist } from 'src/validations/petExists.validation';

export class GetProfilePetDto {
  @IsPetExist({ message: "Pet with id '$value' does not exist!" })
  pet_id: number;
}
