import { ApiBodyOptions } from '@nestjs/swagger';

export const UpdateCommentApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      value: {
        type: 'string',
        maxLength: 100,
        required: ['true'],
      },
      reply_uid: {
        type: 'string',
        required: ['false'],
        description: 'Для ответа пользователю',
      },
    },
  },
};
