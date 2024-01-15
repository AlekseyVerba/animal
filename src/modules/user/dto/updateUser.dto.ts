import {
  IsEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmpty()
  uid: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MinLength(2, {
    message: "Длина поля '$property' должна быть более 2 символов",
  })
  @MaxLength(20, {
    message: "Длина поля '$property' должно быть менее 20 символов",
  })
  @IsOptional()
  name?: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MinLength(3, {
    message: "Длина поля '$property' должна быть более 3 символов",
  })
  @MaxLength(20, {
    message: "Длина поля '$property' должно быть менее 20 символов",
  })
  nickname: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MaxLength(120, {
    message: "Длина поля '$property' должно быть менее 120 символов",
  })
  @IsOptional()
  bio?: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MaxLength(20, {
    message: "Длина поля '$property' должно быть менее 20 символов",
  })
  @IsOptional()
  country?: string;
  @IsString({ message: "Поле '$property' должно быть строкой" })
  @MaxLength(20, {
    message: "Длина поля '$property' должно быть менее 120 символов",
  })
  @IsOptional()
  city?: string;
  @IsOptional()
  tags?: number[];
  avatar: Express.Multer.File;
}
