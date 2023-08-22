import { ApiBodyOptions } from '@nestjs/swagger';

export const getProfileFollowersApiBody: ApiBodyOptions = {
  schema: {
    type: 'object',
    description: `Передавать либо "user_uid", либо "pet_id"`,
    properties: {
      user_uid: {
        type: 'string',
        required: ['false'],
      },
      pet_id: {
        type: 'number',
        required: ['false'],
      },
    },
  },
};
