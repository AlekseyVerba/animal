import { ApiBodyOptions } from '@nestjs/swagger';

export const CreatePetApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 20,
        required: ['true'],
      },
      bio: {
        type: 'string',
        maxLength: 120,
        required: ['false'],
      },
      type: {
        type: 'number',
        required: ['true'],
        description: 'Id родительского тэга',
      },
      breed: {
        type: 'number',
        required: ['false'],
        description: 'Id дочернего тэга',
      },
      date_of_birthday: {
        type: 'string',
        required: ['false'],
      },
    },
  },
};
