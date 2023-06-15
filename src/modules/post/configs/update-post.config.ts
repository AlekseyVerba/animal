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

      main_image: {
        type: 'string',
        description:
          'Фото берет из body. Должно быть так же как и в body "[id]textImage".',
        required: ['false'],
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
