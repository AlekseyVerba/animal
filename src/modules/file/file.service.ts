import { HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { join } from "path";
import { v4 } from 'uuid'

import * as fs from 'fs';
import { IResponseFail } from "src/types/response/index.interface";

import * as sharp from 'sharp'

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
        resizeOptions: { width?: number, height?: number, options?: sharp.ResizeOptions },

    ) {
        try {
            const newNameFile = v4()

            return (await sharp(`${join(__dirname, '..', '..', '..', 'assets')}/${file.fullPath}`)
                .jpeg({ quality })
                .resize(resizeOptions)
                .toFile(join(__dirname, '..', '..', '..', 'assets', file.nameDir, newNameFile + '.jpg')) as any).options.fileOut
        } catch(err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message || 'Error while working with file',
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async generateFileToJPG(file: {
        fullPath: string;
        typeFile: string;
        nameFile: string;
        nameDir: string;
    },
        quality: number
    ) {
        try {
            const newNameFile = v4()

            return (await sharp(`${join(__dirname, '..', '..', '..', 'assets')}/${file.fullPath}`)
                .jpeg({ quality })
                .toFile(join(__dirname, '..', '..', '..', 'assets', file.nameDir, newNameFile + '.jpg')) as any).options.fileOut
        } catch(err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message || 'Error while working with file',
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    createFile(file: Express.Multer.File, nameDir: string) {
        const typeFile = file.originalname.split(".").slice(-1).pop()
        const pathDir = join(__dirname, '..', '..', '..', 'assets', nameDir)

        if (!fs.existsSync(pathDir)) {
            fs.mkdirSync(pathDir, { recursive: true });
        }

        const nameFile = v4()
        const fullNameFile = `${nameFile}.${typeFile}`
        const fullPathFile = join(pathDir, fullNameFile)

        try {
            fs.writeFileSync(fullPathFile, file.buffer)
        } catch (e) {
            const objError: IResponseFail = {
                status: false,
                message: "File creation error"
            }
            throw new InternalServerErrorException(objError)
        }

        return {
            fullPath: `${nameDir}/${fullNameFile}`,
            typeFile: typeFile,
            nameFile,
            nameDir
        }
    }

    async deleteFile(pathFile: string): Promise<boolean> {
        try {
            const fullPath = `${join(__dirname, '..', '..', '..', 'assets')}/${pathFile}`
            console.log(fullPath)
            if (!fs.existsSync(fullPath)) {
                const objError: IResponseFail = {
                    status: false,
                    message: "File not found at given path"
                }
                throw new InternalServerErrorException(objError)
            }

            fs.unlinkSync(fullPath)

            return true

        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }
}
