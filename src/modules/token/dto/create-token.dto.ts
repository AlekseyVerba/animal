import { USER_TOKEN_TYPE } from 'src/types/user-token';

export class CreateTokenDto {
    token: string;
    type: USER_TOKEN_TYPE
    userUid: string;
    expire: string;
}