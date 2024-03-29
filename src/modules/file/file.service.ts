import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { join } from 'path';
import { v4 } from 'uuid';

import * as fs from 'fs';
import { IResponseFail } from 'src/types/response/index.interface';

import * as sharp from 'sharp';

//CONSTANTS
import { PATH_FILE_STATIC } from '../../constants/path-file-static.constant';

@Injectable()
export class FileService {
  async createResizedImage(
    file: {
      fullPath: string;
      typeFile: string;
      nameFile: string;
      nameDir: string;
    },
    quality: number,
    resizeOptions: {
      width?: number;
      height?: number;
      options?: sharp.ResizeOptions;
    },
  ) {
    try {
      const newNameFile = v4();

      const res = (await sharp(`${PATH_FILE_STATIC}/${file.fullPath}`)
        .jpeg({ quality })
        .resize(resizeOptions)
        .toFile(
          join(PATH_FILE_STATIC, file.nameDir, newNameFile + '.jpg'),
          (err, inf) => {
            console.log(err);
            console.log(inf);
          },
        )) as any;

      return res.options.fileOut;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message || 'Ошибка при работе с файлом',
      };

      throw new HttpException(errObj, err.status || 500);
    }
  }

  async generateFileToJPG(
    file: {
      fullPath: string;
      typeFile: string;
      nameFile: string;
      nameDir: string;
    },
    quality: number,
  ) {
    try {
      const newNameFile = v4();

      return (
        (await sharp(`${PATH_FILE_STATIC}/${file.fullPath}`)
          .jpeg({ quality })
          .toFile(
            join(PATH_FILE_STATIC, file.nameDir, newNameFile + '.jpg'),
            (err, inf) => {
              console.log(err);
              console.log(inf);
            },
          )) as any
      ).options.fileOut;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message || 'Ошибка при работе с файлом',
      };

      throw new HttpException(errObj, err.status || 500);
    }
  }

  isImage(type: string) {
    return ['svg', 'jpeg', 'jpg', 'png', 'webp'].includes(type);
  }

  getTypeOfFile(file: Express.Multer.File) {
    return file.originalname.split('.').slice(-1).pop();
  }

  createFile(file: Express.Multer.File, nameDir: string) {
    const typeFile = this.getTypeOfFile(file);
    const pathDir = join(PATH_FILE_STATIC, nameDir);

    if (!fs.existsSync(pathDir)) {
      fs.mkdirSync(pathDir, { recursive: true });
    }

    const nameFile = v4();
    const fullNameFile = `${nameFile}.${typeFile}`;
    const fullPathFile = join(pathDir, fullNameFile);

    try {
      fs.writeFileSync(fullPathFile, file.buffer);
    } catch (e) {
      const objError: IResponseFail = {
        status: false,
        message: 'Ошибка создания файла',
      };
      throw new InternalServerErrorException(objError);
    }

    return {
      fullPath: `${nameDir}/${fullNameFile}`,
      typeFile: typeFile,
      nameFile,
      nameDir,
    };
  }

  async deleteFile(pathFile: string): Promise<boolean> {
    try {
      const fullPath = `${PATH_FILE_STATIC}/${pathFile}`;

      if (!fs.existsSync(fullPath)) {
        const objError: IResponseFail = {
          status: false,
          message: 'Файл не найден по данному пути',
        };
        throw new InternalServerErrorException(objError);
      }

      fs.unlinkSync(fullPath);

      return true;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }
}
