import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const RegistrationApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            secondPassword: { type: 'string' }
        }
    }
};

export const RegistrationApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: 'На вашу почту отправлен код. Необходимо подтверждение!',
            data: '4d58a734-efd1-4b6a-9ff6-70922bd6cd9a'
        }

    }
};

