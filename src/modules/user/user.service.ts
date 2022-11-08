import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { IResponseFail } from "src/types/response/index.interface";
import { User } from '../../models/user.model';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userRepository: typeof User,
    ) { }

    async isUserExistByEmail(email: string): Promise<boolean> {
        try {
            const candidate = await this.userRepository.findOne({
                where: {
                    email
                }
            })

            return candidate ? true : false;
        } catch(err) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Ошибка',
                errors: err
            }
            throw new HttpException(errObj, 400)
        }
    }

    async createUser(dto: CreateUserDto): Promise<User> {
        try {
            return await this.userRepository.create(dto)
        } catch(err) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Ошибка',
                errors: err
            }
            throw new HttpException(errObj, 400)
        }
    }

    async getUserByUid(uid: string): Promise<User> {
        return await this.userRepository.findByPk(uid);
    }

    async getUserByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({
            where: {
                email
            }
        })
    }

    async deleteUser(userUid: string) {
        const candidate = await this.userRepository.findByPk(userUid);
        
        if (!candidate) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Пользователь не найден',
            }

            throw new NotFoundException(errObj);
        }

        return await candidate.destroy();
    }
}
