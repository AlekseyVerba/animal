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
  @MaxLength(100, {
    message: "Длина поля '$property' должно быть менее 100 символов",
  })
  title: string;

  @IsObject()
  body: {
    [key: `${number}text`]: string;
    [key: `${number}textImage`]: string;
  };

  @IsOptional()
  @IsPetExist({ message: "Питомец с id '$value' не существует" })
  pet_id: number;

  @IsOptional()
  @IsString()
  main_image: string;

  @IsString({ each: true })
  tags?: string[];

  current_uid: string;
}
