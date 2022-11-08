import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const CheckUserByEmailApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            email: { type: 'string' },
        }
    }
};

export const CheckUserApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "boolean",
        example: true

    }
};

