import { IsEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { TagExists } from "src/validations/tagExists.validation";

export class CreateAndUpdatePetDto {
    @IsEmpty()
    user_uid: string
    @IsString({ message: 'Field \'$property\' be string' })
    @MinLength(2, { message: 'Field \'$property\' length must be more then 2' })
    @MaxLength(20, { message: 'Field \'$property\' length must be less then 20' })
    name: string;
    @IsString({ message: 'Field \'$property\' be string' })
    @MaxLength(120, { message: 'Field \'$property\' length must be less then 120' })
    @IsOptional()
    bio: string;
    @TagExists({ message: 'Current type does not exist' })
    type: number;
    @TagExists({ message: 'Current breed does not exist' })
    @IsOptional()
    breed: number;
    @IsString({ message: 'Field \'$property\' be string' })
    @IsOptional()
    date_of_birthday: string;
    avatar: Express.Multer.File
}