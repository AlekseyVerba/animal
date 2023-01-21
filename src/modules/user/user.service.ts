import { ConflictException, HttpException, Inject, Injectable } from "@nestjs/common";
import { Pool, PoolClient } from 'pg'
import * as pgFormat from 'pg-format';

//DTO
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

//INTERFACES
import { IUser } from './interfaces/user.interface';
import { IResponseFail } from "src/types/response/index.interface";
import { DATABASE_POOL } from 'src/constants/database.constants';

//SERVICES
import { FileService } from 'src/modules/file/file.service'
import imageSize from "image-size";

@Injectable()
export class UserService {
    constructor(
        @Inject(DATABASE_POOL)
        private readonly database: Pool,
        private readonly fileService: FileService,
    ) { }

    async isUserExistByEmail(email: string): Promise<boolean> {
        try {

            const candidate: IUser = (await this.database.query(`
                SELECT * FROM users
                WHERE email = $1
                LIMIT 1
            `, [email])).rows[0]

            return candidate ? true : false;
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }

    async isUserExistByUid(uid: string): Promise<boolean> {
        try {
            const candidate: IUser = (await this.database.query(`
                SELECT * FROM users
                WHERE uid = $1
                LIMIT 1
            `, [uid])).rows[0]

            return !!candidate;
        } catch (err) {
            console.log(err)
            const errObj: IResponseFail = {
                status: false,
                message: err.message
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }

    async createUser({ email, password }: CreateUserDto): Promise<IUser> {
        try {
            return (await this.database.query(`
                INSERT INTO users(email, password) 
                VALUES(
                    $1, $2
                )
                RETURNING *
            `, [email, password])).rows[0]
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }

    async getUserByUid(uid: string) {
        try {
            const User = (await this.database.query(`
                SELECT * FROM users
                WHERE uid = $1
                LIMIT 1
            `, [uid])).rows[0];

            if (User) {
                delete User.password;
            }

            return User
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }

    async getUserByEmail(email: string): Promise<IUser> {
        try {
            const User = (await this.database.query(`
                SELECT uid, email, "isActivate" FROM users
                WHERE email = $1
                LIMIT 1
            `, [email])).rows[0]

            if (User) {
                delete User.password;
            }

            return User
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }

    async deleteUser(userUid: string) {
        try {
            return await this.database.query('DELETE FROM users WHERE uid = $1', [userUid]);
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: 'User is not found',
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async getUserByNickname(nickname: string) {
        try {
            const User = (await this.database.query(`
                SELECT * FROM users
                WHERE nickname = $1
                LIMIT 1
            `, [nickname])).rows[0]

            if (User) {
                delete User.password;
            }

            return User
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message || 'User is not found',
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async updateUserAvatar(uid: string, avatar: Express.Multer.File, client?: PoolClient) {
        try {
            let currentUserAvatar = (await client.query(`
            SELECT * FROM user_avatar
            WHERE user_uid = $1
        `, [uid])).rows[0]

            const file = await this.fileService.createFile(avatar, 'users')

            const currentImageSize = await imageSize(avatar.buffer)

            const avatars = (await Promise.all([
                this.fileService.createResizedImage(file, 70, { width: 24, height: 24 }),
                this.fileService.createResizedImage(file, 70, { width: 48, height: 48 }),
                this.fileService.createResizedImage(file, 70, { width: 128, height: 128 }),
                currentImageSize.width > 800 ?
                    this.fileService.createResizedImage(file, 70, { width: 800 })
                    : this.fileService.generateFileToJPG(file, 70)
            ])).map((avatar: string) => avatar.split('assets/')[1])


            if (currentUserAvatar) {
                this.fileService.deleteFile(currentUserAvatar.small)
                this.fileService.deleteFile(currentUserAvatar.middle)
                this.fileService.deleteFile(currentUserAvatar.large)
                this.fileService.deleteFile(currentUserAvatar.default_avatar)

                currentUserAvatar = (await client.query(`
                UPDATE user_avatar
                SET small = $2, middle = $3, large = $4, default_avatar = $5
                WHERE user_uid = $1 
            `, [uid, ...avatars])).rows[0]
            } else {
                currentUserAvatar = (await client.query(`
                INSERT INTO user_avatar(user_uid, small, middle, large, default_avatar)
                VALUES (
                    $1, $2, $3, $4, $5
                )
            `, [uid, ...avatars])).rows[0]
            }

            // this.fileService.deleteFile(file.fullPath)
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message || 'Error while working with file',
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async updateUser({ tags, uid, avatar, ...dto }: UpdateUserDto) {
        const client = await this.database.connect()
        try {

            const userByNickname = await this.getUserByNickname(dto.nickname)

            if (userByNickname && userByNickname.uid !== uid) {
                const errObj: IResponseFail = {
                    status: false,
                    message: 'This nickname is already taken. Try another',
                }

                throw new ConflictException(errObj)
            }

            if (avatar) {
                await this.updateUserAvatar(uid, avatar, client)
            }

            if (tags && tags.length) {
                const values = tags.map(tag => ([uid, tag]))

                await this.database.query(pgFormat(`
                    INSERT INTO user_tag VALUES %L
                `, values), [])
            }

            let query = ``;
            let i: number = 2;
            const values = []

            for (const key in dto) {
                query += `${key} = $${i}, `;
                i++
                values.push(dto[key])
            };

            if (query) {
                query = query.slice(0, -2)
            }

            const User = (await client.query(`
                UPDATE users
                SET ${query}
                WHERE uid = $1
                RETURNING *
            `, [uid, ...values])).rows[0]

            await client.query('COMMIT')

            if (User) {
                delete User.password;
            }

            return User
        } catch (err) {
            await client.query('ROLLBACK')
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }
            throw new HttpException(errObj, err.status || 500)
        } finally {
            await client.release()
        }
    }
}
