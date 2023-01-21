import { Inject, Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    isNumber
} from 'class-validator';
import { PetService } from 'src/modules/pet/pet.service'

@Injectable()
@ValidatorConstraint({ async: true })
export class IsPetExistConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(PetService) private petService: PetService) { }

    async validate(userName: any, args: ValidationArguments) {
        return this.petService.getPetById(userName).then(result => {
            return !!result
        });
    }
}

export function IsPetExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPetExistConstraint,
        });
    };
}