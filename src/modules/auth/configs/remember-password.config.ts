import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const RememberPasswordApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            email: { type: 'string' },
        }
    }
};

export const RememberPasswordApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: 'На вашу почту отправлена ссылка'
        }

    }
};

