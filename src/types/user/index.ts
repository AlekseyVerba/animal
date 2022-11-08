import { User } from '../../models/user.model';

export type IUserForToken = Pick<User, 'uid' | 'email'>