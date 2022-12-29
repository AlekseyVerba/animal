import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const AuthorizationApiBody: ApiBodyOptions = {
    schema: {
        type: 'object',
        properties: {
            email: { type: 'string' },
            password: { type: 'string' },
        }
    }
};

export const AuthorizationApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: 'Success',
            data: {
                user: {
                    uid: "4d58a734-efd1-4b6a-9ff6-70922bd6cd9a",
                    email: "tejic59567@fgvod.com",
                    isActivate: true
                },
                jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0ZDU4YTczNC1lZmQxLTRiNmEtOWZmNi03MDkyMmJkNmNkOWEiLCJlbWFpbCI6InRlamljNTk1NjdAZmd2b2QuY29tIiwiaWF0IjoxNjY3OTM5Njk2fQ.KEVTixHzIeYEVyKzXnguKfTceyFdmUKf0JgmTDlH4b0"
            }
        }

    }
};

