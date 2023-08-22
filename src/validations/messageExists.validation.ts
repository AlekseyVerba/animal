import { Inject, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

//SERVICES
import { ChatService } from '../modules/chat/chat.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsMessageExistConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(ChatService) private chatService: ChatService) {}

  async validate(id: any, args: ValidationArguments) {
    return await this.chatService.isMessageExistsById(id);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Сообщение не существует`;
  }
}

export function IsMessagerExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMessageExistConstraint,
    });
  };
}
