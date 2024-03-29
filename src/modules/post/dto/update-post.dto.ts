import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { IsPostExist } from 'src/validations/postExists.validation';

export class UpdatePostDto {
  @IsPostExist()
  id: number;

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
  @IsString()
  main_image: string;

  current_uid: string;
}
