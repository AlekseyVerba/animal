import { ApiBodyOptions } from '@nestjs/swagger';

export const GetLinePostsApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    description: `Получение постов пользователя.
            Есть сортировка по получению постов.
            from_users_and_pets - Получение постов по подпискам. сортировка created_at DESC
            tag - Получение случайных постов по тэгам пользователя. В этом случае если пользователь просмотрел запись (
                использовал ep - GET /post/{postId}) Проект не будет добавлен в ответ. Когда используем эту сортировку 
                нужно передавать в свойство "seenIdPosts" id проектов которые были выданы в общем количестве до текущего запроса.
                Т.к этот метод возрващает всегда рандомные посты, нужно отслеживать какие посты уже были отданы
        `,
    properties: {
      limit: {
        type: 'nmuber',
        maxLength: 20,
        required: ['false'],
        default: 20,
      },
      offset: {
        type: 'nmuber',
        required: ['false'],
        default: 0,
      },

      order: {
        type: 'string',
        required: ['false'],
        enum: ['from_users_and_pets', 'tag'],
        default: 'from_users_and_pets',
      },

      seenIdPosts: {
        type: 'array',
        items: {
          type: 'number',
        },
        description:
          'Используется только для порядка "tag". В случае from_users_and_pets передаём пустой массив',
        required: ['true'],
      },
    },
  },
};
