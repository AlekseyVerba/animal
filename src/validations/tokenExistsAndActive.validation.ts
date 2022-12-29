import { Inject, Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    isUUID
} from 'class-validator';
import { TokenService } from 'src/modules/token/token.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsTokenExistsAndActiveConstraint implements ValidatorConstraintInterface {
    constructor(
        @Inject(TokenService) private tokenService: TokenService,
        @Inject(UserService) private userService: UserService,
    ) { }

    async validate(userName: any, args: ValidationArguments) {
        const email = (args.object as any).email
        
        const user = await this.userService.getUserByEmail(email)
        console.log(user)
        if (!user) return false
        
        const token = await this.tokenService.getToken({ token: userName, userUid: user.uid })

        if (!token || !token.isActive || +token.expire <= Date.now()) return false

        return true
    }
}

export function IsTokenExistsAndActive(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsTokenExistsAndActiveConstraint,
        });
    };
}