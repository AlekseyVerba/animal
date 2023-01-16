import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {join} from "path";
import { v4 } from 'uuid'

import * as fs from 'fs';
import { IResponseFail } from "src/types/response/index.interface";

@Injectable()
export class FileService {
    createFile(file: Express.Multer.File, nameDir: string): string {
        const typeFile = file.originalname.split(".").slice(-1).pop()
        console.log(typeFile)
        const pathDir = join(__dirname, '..', '..', '..', 'assets', nameDir, typeFile)

        if (!fs.existsSync(pathDir)) {
            fs.mkdirSync(pathDir, {recursive: true});
        }

        const nameFile = `${v4()}.${typeFile}`
        const fullPathFile = join(pathDir, nameFile)

        try {
            fs.writeFileSync(fullPathFile, file.buffer)
        } catch(e) {
            const objError: IResponseFail = {
                status: false,
                message: "Ошибка создания файла"
            }
            throw new InternalServerErrorException(objError)
        }

        return `${nameDir}/${typeFile}/${nameFile}`
    }

    async deleteFile(pathFile: string): Promise<boolean> {
        try {

            if (!fs.existsSync(pathFile)) {
                const objError: IResponseFail = {
                    status: false,
                    message: "Не найден файл по заданному пути"
                }
                throw new InternalServerErrorException(objError)
            }

            console.log(pathFile)

            fs.unlinkSync(pathFile)

            return true

        } catch(e) {
            const objError: IResponseFail = {
                status: false,
                message: "Ошибка при удалении файла"
            }
            throw new InternalServerErrorException(objError)
        }
    }
}
