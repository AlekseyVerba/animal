import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isNumber,
} from 'class-validator';
import { LikeService } from '../modules/like/like.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsLikeExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(LikeService) private likeService: LikeService) {}

  async validate(id: number, args: ValidationArguments) {
    return this.likeService.getLike(id).then((result) => {
      return !!result;
    });
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Лайк с данным id не существует';
  }
}

export function IsLikeExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLikeExistConstraint,
    });
  };
}
