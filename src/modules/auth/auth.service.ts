// PROJECT
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { Pool } from 'pg';

//DTO
import { RegistrationConfirmDto } from './dto/registration-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegistrationDto } from './dto/registration.dto';

//INTERFACES
import { USER_TOKEN_TYPE } from '../../types/user-token';
import { DATABASE_POOL } from 'src/constants/database.constants';
import { IResponseFail } from '../../types/response/index.interface';

//SERVICES
import { MessageService } from '../message/message.service';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly tokenService: TokenService,
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  async registration({ password, email }: RegistrationDto) {
    const client = await this.database.connect();
    try {
      await client.query('BEGIN');

      const hashPassword = await hash(password, 8);

      let user = await this.userService.getUserByEmail(email);

      if (!user) {
        // Create user
        user = (
          await client.query(
            `
                    INSERT INTO users(email, password) 
                    VALUES(
                        $1, $2
                    )
                    RETURNING *
                `,
            [email, hashPassword],
          )
        ).rows[0];
      }

      const code = `1111`;

      // Create token
      await client.query(
        `
                INSERT INTO user_token(token, type, "userUid", expire)
                VALUES(
                    $1, $2, $3, $4
                )
                RETURNING *
            `,
        [
          code,
          USER_TOKEN_TYPE.Registration,
          user.uid,
          Date.now() + 60 * 60 * 1000 + '',
        ],
      );

      // Send email
      this.messageService.registration({ code, email });

      await client.query('COMMIT');

      return user.uid;
    } catch (err) {
      await client.query('ROLLBACK');
      const objError: IResponseFail = {
        status: false,
        message: err.message,
      };

      throw new HttpException(objError, 400);
    } finally {
      await client.release();
    }
  }

  async login({ password, email }: LoginDto): Promise<any> {
    const candidate = (
      await this.database.query(
        `
              SELECT "isActivate", password, uid, email FROM users
              WHERE email = $1
              LIMIT 1
          `,
        [email],
      )
    ).rows[0];

    if (!candidate.isActivate) {
      const objError: IResponseFail = {
        status: false,
        message: 'Пользователь не активен',
      };

      throw new BadRequestException(objError);
    }

    const checkPassword = await compare(password, candidate.password);

    if (!checkPassword) {
      const objError: IResponseFail = {
        status: false,
        message: 'Некорректные данные',
      };

      throw new BadRequestException(objError);
    }

    const jwtToken = sign(
      { uid: candidate.uid, email: candidate.email },
      process.env.JWT_SECRET,
    );

    return {
      user: await this.userService.getUserWithAvatars(candidate.uid),
      jwtToken,
    };
  }

  async confirmRegistration({ code, email }: RegistrationConfirmDto) {
    const user = await this.tokenService.confirmRegistration({
      token: code,
      email,
    });
    const jwtToken = sign(
      { uid: user.uid, email: user.email },
      process.env.JWT_SECRET,
    );

    return {
      user,
      jwtToken,
    };
  }

  async authCheck(uid: string) {
    const candidate = await this.userService.getUserByUid(uid);

    if (!candidate) {
      const objError: IResponseFail = {
        status: false,
        message: 'Пользователь не найден',
      };

      throw new NotFoundException(objError);
    }

    const jwtToken = sign(
      { uid: candidate.uid, email: candidate.email },
      process.env.JWT_SECRET,
    );

    return {
      user: candidate,
      jwtToken,
    };
  }

  async rememberPassword(email: string): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const candidate = await this.userService.getUserByEmail(email);

      if (!candidate.isActivate) {
        const objError: IResponseFail = {
          status: false,
          message: 'Пользователь не активен',
        };

        throw new ForbiddenException(objError);
      }

      const code = '1111';

      // Create token
      await client.query(
        `
                INSERT INTO user_token(token, type, "userUid", expire)
                VALUES(
                    $1, $2, $3, $4
                )
                RETURNING *
            `,
        [
          code,
          USER_TOKEN_TYPE.RememberPassword,
          candidate.uid,
          Date.now() + 60 * 60 * 1000 + '',
        ],
      );

      this.messageService.rememberPassword({ code, email });

      await client.query('COMMIT');

      return true;
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

  async changePassword({
    email,
    password,
    code,
  }: ChangePasswordDto): Promise<boolean> {
    const client = await this.database.connect();
    try {
      const hashPassword = await hash(password, 8);

      await Promise.all([
        client.query(
          `
                    UPDATE users
                    SET password = $2
                    WHERE email = $1
                `,
          [email, hashPassword],
        ),

        client.query(
          `
                    UPDATE user_token
                    SET "isActive" = false
                    FROM users
                    WHERE user_token.token = $1 AND users.email = $2 AND user_token."isActive" = true AND user_token.type = $3;
                `,
          [code, email, USER_TOKEN_TYPE.RememberPassword],
        ),
      ]);

      return true;
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
}
