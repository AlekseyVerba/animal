import { ApiResponseOptions } from '@nestjs/swagger';

export const CheckAuthApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: "User successfully verified",
            data: {
                user: {
                    uid: "4d58a734-efd1-4b6a-9ff6-70922bd6cd9a",
                    email: "tejic59567@fgvod.com", 
                    isActivate: true
                },
                jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0ZDU4YTczNC1lZmQxLTRiNmEtOWZmNi03MDkyMmJkNmNkOWEiLCJlbWFpbCI6InRlamljNTk1NjdAZmd2b2QuY29tIiwiaWF0IjoxNjY3OTQwODgzfQ.x2UwdoU_DBXrFGPnZ3uI7y_7UWNnQNb60U6Ipb23nPk"
            }
        }

    }
};