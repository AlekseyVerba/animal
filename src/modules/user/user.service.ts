import { ConflictException, HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Pool } from 'pg'
import * as pgFormat from 'pg-format';

//DTO
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

//INTERFACES
import { IUser } from './interfaces/user.interface';
import { IResponseFail } from "src/types/response/index.interface";
import { DATABASE_POOL } from 'src/constants/database.constants';

@Injectable()
export class UserService {
    constructor(
        @Inject(DATABASE_POOL)
        private readonly database: Pool
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

            return candidate ? true : false;
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
                message: 'User is not found',
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async updateUser({tags, uid, ...dto}: UpdateUserDto) {
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

            if (tags && tags.length) {
                const values = tags.map(tag => ([uid, tag]))

                await this.database.query(pgFormat(`
                    INSERT INTO user_tag VALUES %L
                `, values), [])
            }

            let query = ``;
            let i: number = 2;
            const values = []

            for(const key in dto ) {
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
            return new HttpException(err.message, err.status || 500)
        } finally {
            await client.release()
        }
    }
}
