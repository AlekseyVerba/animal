import { ApiBodyOptions } from '@nestjs/swagger';
import { TYPE_LIKES } from '../constants/TYPE-LIKES.constant';

export const AddLikeApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    description: `Метод используется для поста и комментария`,
    properties: {
      value: {
        type: 'string',
        maxLength: 100,
        required: ['true'],
        enum: [
          TYPE_LIKES.SMILE,
          TYPE_LIKES.LIKE,
          TYPE_LIKES.DISLIKE,
          TYPE_LIKES.HEART,
        ] as TYPE_LIKES[],
      },

      commentId: {
        type: 'number',
        required: ['false'],
      },

      postId: {
        type: 'number',
        required: ['false'],
      },
    },
  },
};
