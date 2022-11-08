import { BadRequestException, GatewayTimeoutException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';
import { IResponseFail } from 'src/types/response/index.interface';
import { UserToken } from '../../models/user-token.model';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { USER_TOKEN_TYPE } from '../../types/user-token';

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(UserToken)
        private userTokenRepository: typeof UserToken,
        @InjectModel(User)
        private userRepository: typeof User,
    ) { }

    async confirmRegistration({ token, email }: ConfirmRegistrationDto): Promise<User> {

        const user = await this.userRepository.findOne({
            where: {
                email
            }
        })

        if(!user) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Пользователь не найден',
            }

            throw new NotFoundException(errObj);
        }

        const tokenCandidate = await this.userTokenRepository.findOne({
            where: {
                userUid: user.uid,
                token,
                type: USER_TOKEN_TYPE.Registration
            }
        })

        if (!tokenCandidate) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Токен не существует у данного пользователя',
            }

            throw new BadRequestException(errObj);
        }

        if (!tokenCandidate.isActive) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Данный токен не активен',
            }

            throw new BadRequestException(errObj);
        }

        if (+tokenCandidate.expire <= Date.now()) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Истекло время токена',
            }

            throw new GatewayTimeoutException(errObj);
        }

        tokenCandidate.update({ isActive: false })
        
        const currentUser = (await this.userRepository.findByPk(user.uid)).update({ isActivate: true })

        return currentUser
    }

    async confirmChangePasswordToken(token: string): Promise<string> {
        const tokenCandidate = await this.userTokenRepository.findOne({
            where: {
                token,
                type: USER_TOKEN_TYPE.RememberPassword
            }
        })


        if (!tokenCandidate) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Токен не существует',
            }

            throw new BadRequestException(errObj);
        }

        if (!tokenCandidate.isActive) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Данный токен не активен',
            }

            throw new BadRequestException(errObj);
        }

        if (+tokenCandidate.expire <= Date.now()) {
            const errObj: IResponseFail = {
                status: false,
                message: 'Истекло время токена',
            }

            throw new GatewayTimeoutException(errObj);
        }

        tokenCandidate.update({ isActive: false })

        return tokenCandidate.userUid;
    }
}