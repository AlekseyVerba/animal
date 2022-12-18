import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { USER_TOKEN_TYPE } from '../types/user-token';
import { User } from './user.model';

@Table({})
export class UserToken extends Model<UserToken> {
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @Column({ type: DataType.STRING })
    token: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isActive: boolean

    @Column({ type: DataType.STRING })
    type: USER_TOKEN_TYPE;

    @Column({ type: DataType.STRING, allowNull: false })
    expire: string;

    @ForeignKey(() => User)
    userUid: string;

    @BelongsTo(() => User, { onDelete: 'cascade' })
    user: User
}
