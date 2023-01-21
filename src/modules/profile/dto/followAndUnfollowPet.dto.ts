import { IsEmpty } from "class-validator";
import { IsPetExist } from 'src/validations/petExists.validation';

export class FollowAndUnfollowPetDto {
    @IsPetExist({ message: 'Pet with id \'$value\' does not exist!' })
    pet_id: string;
    @IsEmpty()
    current_uid: string;
}