import { ApiBodyOptions } from '@nestjs/swagger';

export const CreatePostApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    description: `
            В body разделение на части (фото и текст).
            Так же данный метод поддерживает загрузку файлов.
            Что бы добавить фото в body, нужно:
            1. Добавить в form data файл с именем "newImage[id]".
            2. Добавить в тело body "textImage[id]"
        `,
    properties: {
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

      pet_id: {
        type: 'number',
        required: ['true'],
      },

      tags: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
};
