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
    },
  },
};
