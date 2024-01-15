import {
  IsEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TagExists } from 'src/validations/tagExists.validation';

export class CreateAndUpdatePetDto {
  @IsEmpty()
  user_uid: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MinLength(2, {
    message: "Длина поля '$property' должно быть более 2 символов",
  })
  @MaxLength(20, {
    message: "Длина поля '$property' должно быть менее 20 символов",
  })
  name: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MaxLength(120, {
    message: "Длина поля '$property' должно быть менее 120 символов",
  })
  @IsOptional()
  bio: string;
  @TagExists({ message: 'Текущий тип не существует' })
  type: number;
  @TagExists({ message: 'Текущая порода не существует' })
  @IsOptional()
  breed: number;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @IsOptional()
  date_of_birthday: string;
  avatar: Express.Multer.File;
}
