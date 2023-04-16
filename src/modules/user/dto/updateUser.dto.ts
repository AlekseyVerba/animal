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
  @IsString({ message: "Field '$property' be string" })
  @MinLength(2, { message: "Field '$property' length must be more then 2" })
  @MaxLength(20, { message: "Field '$property' length must be less then 20" })
  @IsOptional()
  name?: string;
  @IsString({ message: "Field '$property' be string" })
  @MinLength(3, { message: "Field '$property' length must be more then 3" })
  @MaxLength(20, { message: "Field '$property' length must be less then 20" })
  nickname: string;
  @IsString({ message: "Field '$property' be string" })
  @MaxLength(120, { message: "Field '$property' length must be less then 120" })
  @IsOptional()
  bio?: string;
  @IsString({ message: "Field '$property' be string" })
  @MaxLength(20, { message: "Field '$property' length must be less then 20" })
  @IsOptional()
  country?: string;
  @IsString({ message: "Field '$property' be string" })
  @MaxLength(20, { message: "Field '$property' length must be less then 120" })
  @IsOptional()
  city?: string;
  @IsOptional()
  tags?: number[];
  avatar: Express.Multer.File;
}
