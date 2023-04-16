import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isUUID,
} from 'class-validator';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUserExistByEmailConstraint
  implements ValidatorConstraintInterface
{
  constructor(@Inject(UserService) private userService: UserService) {}

  async validate(userName: any, args: ValidationArguments) {
    return this.userService.getUserByEmail(userName).then((result) => {
      return !!result;
    });
  }
}

export function IsUserExistByEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserExistByEmailConstraint,
    });
  };
}
