import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const RegistrationConfirmTokenApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            email: { type: 'string' },
            code: { type: 'string' }
        }
    }
};

export const RegistrationConfirmTokenApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: 'User successfully verified',
        }

    }
};

