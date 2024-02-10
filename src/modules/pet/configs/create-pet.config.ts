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
        type: 'string',
        required: ['false'],
        description: 'Id родительского тэга',
      },
      breed: {
        type: 'string',
        required: ['false'],
        description: 'Id дочернего тэга',
      },
      date_of_birthday: {
        type: 'string',
        required: ['false'],
      },
      avatar: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};
