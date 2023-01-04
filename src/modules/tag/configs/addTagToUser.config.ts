import { ApiBodyOptions } from '@nestjs/swagger';

export const AddTagToUserApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            tag_id: { type: 'number' }
        }
    }
};
