import { ApiBodyOptions } from '@nestjs/swagger';

export const UpdateUserApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 20,
        required: ['false'],
      },
      nickname: {
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
      country: {
        type: 'string',
        maxLength: 20,
        required: ['false'],
      },
      city: {
        type: 'string',
        maxLength: 20,
        required: ['false'],
      },
      tags: {
        type: 'array',
        items: {
          type: 'number',
        },
      },
    },
  },
};
