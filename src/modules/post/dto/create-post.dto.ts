import { IsNotEmpty, IsObject, IsString, Max, MaxLength } from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';

export class CreatePostDto {
  @IsString()
  @MaxLength(100, { message: "Field '$property' length must be less then 100" })
  title: string;

  @IsNotEmpty()
  body: {
    [key: `text${number}`]: string;
    [key: `textImage${number}`]: string;
  };

  @IsPetExist({ message: "Pet with id '$value' does not exist!" })
  pet_id: number;

  @IsString({ each: true })
  tags?: string[];

  current_uid: string;
}
