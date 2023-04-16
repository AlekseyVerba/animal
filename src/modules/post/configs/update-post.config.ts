import { ApiBodyOptions } from '@nestjs/swagger';

export const UpdatePostApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    description: 'Та же логика что и создание поста',
    properties: {
      id: {
        type: 'number',
      },

      title: {
        type: 'string',
        maxLength: 100,
        required: ['true'],
      },

      body: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
          },
          textImage: {
            type: 'string',
          },
        },
      },
    },
  },
};
