import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Pool } from 'pg'

//DTO
import { CreateUserDto } from './dto/createUser.dto';

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
            return (await this.database.query(`
                SELECT uid, email, "isActivate" FROM users
                WHERE uid = $1
                LIMIT 1
            `, [uid])).rows[0];
        } catch(err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message
            }
            throw new HttpException(errObj, err.status || 500)
        }
    }

    async getUserByEmail(email: string): Promise<IUser> {
        try {
            return (await this.database.query(`
                SELECT uid, email, "isActivate" FROM users
                WHERE email = $1
                LIMIT 1
            `, [email])).rows[0]
        } catch(err) {
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
}
