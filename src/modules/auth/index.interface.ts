import { User } from '../../models/user.model';

export type IUserWithToken = {
    user: User,
    jwtToken: string;
}