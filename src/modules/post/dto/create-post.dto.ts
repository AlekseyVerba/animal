import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { IsPetExist } from 'src/validations/petExists.validation';

export class CreatePostDto {
  @IsString()
  @MaxLength(100, { message: "Field '$property' length must be less then 100" })
  title: string;

  @IsObject()
  body: {
    [key: `${number}text`]: string;
    [key: `${number}textImage`]: string;
  };

  @IsOptional()
  @IsPetExist({ message: "Pet with id '$value' does not exist!" })
  pet_id: number;

  @IsOptional()
  @IsString()
  main_image: string;

  @IsString({ each: true })
  tags?: string[];

  current_uid: string;
}
