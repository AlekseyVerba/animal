import { DataTypes } from 'sequelize';
import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { UserToken } from './user-token.model';


@Table({ tableName: 'Users', defaultScope: { attributes: { exclude: ['password', 'isActivate'] } }, scopes: { auth: {} } })
export class User extends Model<User> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true
    })
    uid: string;

    @Column({ type: DataType.TEXT })
    email: string;

    @Column({ type: DataType.TEXT })
    password: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isActivate: boolean;

    @HasMany(() => UserToken)
    tokens: UserToken[]
}
