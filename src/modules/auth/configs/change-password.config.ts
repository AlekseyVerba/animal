import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const ChangePasswordApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            password: { type: 'string' },
            secondPassword: { type: 'string' },
        }
    }
};

export const ChangePasswordApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: 'Пароль изменен'
        }

    }
};

