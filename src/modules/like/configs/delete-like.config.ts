import { ApiBodyOptions } from '@nestjs/swagger';

export const DeleteLikeApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    properties: {
      postId: {
        type: 'number',
        required: ['false'],
      },

      commentId: {
        type: 'number',
        required: ['false'],
      },

      messageId: {
        type: 'number',
        required: ['false'],
      },
    },
  },
};
