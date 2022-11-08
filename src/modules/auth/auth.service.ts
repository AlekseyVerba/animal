import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserService } from '../user/user.service';
import { RegistrationDto } from './dto/registration.dto';
import { IResponseFail } from '../../types/response/index.interface';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken'
import { JWT_SECRET } from '../../constants/keys';
import { generate } from 'short-uuid';

//DTO
import { RegistrationConfirmDto } from './dto/registration-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

//INTERFACES
import { USER_TOKEN_TYPE } from '../../types/user-token';

//SERVICES
import { MessageService } from '../message/message.service';
import { InjectModel } from "@nestjs/sequelize";
import { TokenService } from '../token/token.service';

//MODELS
import { UserToken } from '../../models/user-token.model';
import { User } from "src/models/user.model";


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly tokenService: TokenService,
        @InjectModel(UserToken)
        private userTokenRepository: typeof UserToken,
        @InjectModel(User)
        private userRepository: typeof User,
    ) { }

    async registration({ password, email, secondPassword }: RegistrationDto) {

        try {
            const isUserExist = await this.userService.isUserExistByEmail(email);

            if (password !== secondPassword) {
                const objError: IResponseFail = {
                    status: false,
                    message: 'Пароли не совпадают'
                }

                throw new BadRequestException(objError)
            }

            if (isUserExist) {
                const objError: IResponseFail = {
                    status: false,
                    message: 'Пользователь с такой почтой уже существует'
                }

                throw new ConflictException(objError)
            }

            const hashPassword = await hash(password, 8)

            const user = await this.userService.createUser({ email, password: hashPassword })

            const code = `1111`;

            const messageResult = await this.messageService.registration({ code, email });

            if (!user || !messageResult) {
                const objError: IResponseFail = {
                    status: false,
                    message: 'Ошибка'
                }

                throw new InternalServerErrorException(objError)
            };

            const res = await this.userTokenRepository.create({ token: code, type: USER_TOKEN_TYPE.Registration, userUid: user.uid });

            return user.uid;
        } catch(err) {
            throw err
        }
    }

    async login({ password, email }: LoginDto): Promise<any> {
        const candidate = await this.userRepository.scope('auth').findOne({
            where: {
                email
            }
        })

        if(!candidate) {
            const objError: IResponseFail = {
                status: false,
                message: 'Неверный данные'
            }

            throw new BadRequestException(objError)
        }

        if (!candidate.isActivate) {
            const objError: IResponseFail = {
                status: false,
                message: 'Пользователь не активный'
            }

            throw new BadRequestException(objError)
        }

        const checkPassword = await compare(password, candidate.password)

        if (!checkPassword) {
            const objError: IResponseFail = {
                status: false,
                message: 'Неверный данные'
            }

            throw new BadRequestException(objError)
        }

        const user = await this.userRepository.findByPk(candidate.uid)

        const jwtToken = sign({ uid: user.uid, email: user.email }, JWT_SECRET)

        return {
            user,
            jwtToken
        }
    }

    async confirmRegistration(dto: RegistrationConfirmDto): Promise<User> {
        return await this.tokenService.confirmRegistration(dto);
    }

    async authCheck(uid: string) {
        const candidate = await this.userRepository.findByPk(uid);

        if (!candidate) {
            const objError: IResponseFail = {
                status: false,
                message: 'Пользователь не найден'
            }

            throw new NotFoundException(objError)
        }

        const jwtToken = sign({ uid: candidate.uid, email: candidate.email }, JWT_SECRET)

        return {
            user: candidate,
            jwtToken
        }
    }

    async rememberPassword(email: string): Promise<boolean> {
        const candidate = await this.userRepository.findOne({
            where: {
                email
            }
        })

        if (!candidate) {
            const objError: IResponseFail = {
                status: false,
                message: 'Пользователь не найден'
            }

            throw new NotFoundException(objError)
        }

        const code = generate()

        await this.userTokenRepository.create({ token: code, type: USER_TOKEN_TYPE.RememberPassword, userUid: candidate.uid })

        await this.messageService.rememberPassword({ code, email });

        return true;
    }

    async changePassword(dto: ChangePasswordDto): Promise<boolean> {

        if (dto.password !== dto.secondPassword) {
            const objError: IResponseFail = {
                status: false,
                message: 'Пароли не совпадают'
            }

            throw new BadRequestException(objError)
        }

        const userUid = await this.tokenService.confirmChangePasswordToken(dto.token);
        const user = await this.userRepository.findByPk(userUid)

        if (!user) {
            const objError: IResponseFail = {
                status: false,
                message: 'Пользователь не найден'
            }

            throw new NotFoundException(objError)
        }

        const hashPassword = await hash(dto.password, 8)

        await user.update({ password: hashPassword })
        
        return true;
    }
}