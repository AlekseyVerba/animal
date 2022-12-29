import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const ChangePasswordApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            code: { type: 'string' }
        }
    }
};

export const ChangePasswordApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: 'Password was changed'
        }

    }
};

