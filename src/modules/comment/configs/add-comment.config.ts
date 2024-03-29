import { ApiBodyOptions } from '@nestjs/swagger';

export const AddCommentApiBody: ApiBodyOptions = {
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
      parent_id: {
        type: 'number',
        required: ['false'],
        description:
          'Для оставления комментария под комментарием. Вложенность может быть только из 1 дерева. Как в инстаграме',
      },
    },
  },
};
