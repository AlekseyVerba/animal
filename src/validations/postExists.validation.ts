import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isNumber,
} from 'class-validator';
import { PostService } from '../modules/post/post.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsPostExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(PostService) private postService: PostService) {}

  async validate(id: number, args: ValidationArguments) {
    return this.postService.getPostShort(id).then((result) => {
      return !!result;
    });
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Пост с таким id не существует';
  }
}

export function IsPostExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPostExistConstraint,
    });
  };
}
