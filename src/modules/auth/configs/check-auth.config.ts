import { ApiResponseOptions } from '@nestjs/swagger';

export const CheckAuthApiResponse: ApiResponseOptions = {
    status: 201,
    schema: {
        type: "object",
        example: {
            status: true,
            message: "Пользователь успешно подтвержден",
            data: {
                user: {
                    uid: "4d58a734-efd1-4b6a-9ff6-70922bd6cd9a",
                    email: "tejic59567@fgvod.com",
                    createdAt: "2022-11-08T18:50:41.344Z",
                    updatedAt: "2022-11-08T20:34:21.996Z"
                },
                jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI0ZDU4YTczNC1lZmQxLTRiNmEtOWZmNi03MDkyMmJkNmNkOWEiLCJlbWFpbCI6InRlamljNTk1NjdAZmd2b2QuY29tIiwiaWF0IjoxNjY3OTQwODgzfQ.x2UwdoU_DBXrFGPnZ3uI7y_7UWNnQNb60U6Ipb23nPk"
            }
        }

    }
};