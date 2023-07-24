import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

//DTO
import { GetTokenDto } from './dto/get-token.dto';
import { CreateTokenDto } from './dto/create-token.dto';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';

//INTERFACES
import { DATABASE_POOL } from 'src/constants/database.constants';
import { IResponseFail } from 'src/types/response/index.interface';
import { USER_TOKEN_TYPE } from '../../types/user-token';

@Injectable()
export class TokenService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  async createToken({ token, type, userUid, expire }: CreateTokenDto) {
    return (
      await this.database.query(
        `
              INSERT INTO user_token(token, type, "serUid", expire)
              VALUES(
                  $1, $2, $3, $4
              )
              RETURNING *
          `,
        [token, type, userUid, expire],
      )
    ).rows[0];
  }

  async confirmRegistration({ token, email }: ConfirmRegistrationDto) {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');

      const [user] = await Promise.all([
        client.query(
          `
                    UPDATE users
                    SET "isActivate" = true
                    WHERE email = $1
                    RETURNING uid, email, "isActivate"
                `,
          [email],
        ),

        client.query(
          `
                    UPDATE user_token
                    SET "isActive" = false
                    FROM users
                    WHERE user_token.token = $1 AND users.email = $2 AND user_token."isActive" = true AND user_token.type = $3;
                `,
          [token, email, USER_TOKEN_TYPE.Registration],
        ),
      ]);

      await client.query('COMMIT');

      return user.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');

      const objError: IResponseFail = {
        status: false,
        message: err.message,
      };

      throw new HttpException(objError, err.status || 500);
    } finally {
      await client.release();
    }
  }

  async getToken({ token, userUid }: GetTokenDto) {
    return (
      await this.database.query(
        `
              SELECT * FROM user_token
              WHERE token = $1 AND "userUid" = $2 AND "isActive" = true
              LIMIT 1
          `,
        [token, userUid],
      )
    ).rows[0];
  }
}
