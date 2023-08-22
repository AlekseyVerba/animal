import { IsEmpty, IsOptional } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';
import { IsUserExist } from 'src/validations/userExists.validation';

export class GetProfileFollowersDto {
  @IsOptional()
  @IsUserExist({ message: "User with uid '$value' does not exist!" })
  user_uid?: string;

  @IsOptional()
  @IsPetExist({ message: "Pet with id '$value' does not exist!" })
  pet_id?: string;

  @IsEmpty()
  uid?: string;
}
