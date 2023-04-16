import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  isNumber,
} from 'class-validator';
import { CommentService } from '../modules/comment/comment.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCommentExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(CommentService) private commentService: CommentService) {}

  async validate(id: number, args: ValidationArguments) {
    return this.commentService.getCommentId(id).then((result) => {
      return !!result;
    });
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Комментарий с данным id не существует';
  }
}

export function IsCommentExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCommentExistConstraint,
    });
  };
}
