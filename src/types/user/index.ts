import { IUser } from 'src/modules/user/interfaces/user.interface';

export type IUserForToken = Pick<IUser, 'uid' | 'email'>