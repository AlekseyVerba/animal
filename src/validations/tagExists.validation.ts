import { Inject, Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    isUUID
} from 'class-validator';
import { TagService } from 'src/modules/tag/tag.service'

@Injectable()
@ValidatorConstraint({ async: true })
export class TagExistsConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(TagService) private tagService: TagService) { }
    async validate(userName: any, args: ValidationArguments) {
        console.log('yyy')
        return this.tagService.getTagById(userName).then(result => {
            console.log(result)
            return !!result
        });
    }
}

export function TagExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: TagExistsConstraint,
        });
    };
}