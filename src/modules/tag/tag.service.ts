import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from 'src/constants/database.constants';
import { IResponseFail } from 'src/types/response/index.interface';

//DTO
import { AddTagToUserDto } from './dto/add-tag-to-user.dto';

@Injectable()
export class TagService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  async getAllParentTags() {
    try {
      return (
        await this.database.query(`
            SELECT * FROM tags
            WHERE parent_id IS null
        `)
      ).rows;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async getAllChildsTagsFromParent(parent_id: number) {
    try {
      return (
        await this.database.query(
          `
                SELECT * FROM tags
                WHERE parent_id = $1
            `,
          [parent_id],
        )
      ).rows;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async getTagById(id: number) {
    try {
      return (
        await this.database.query(
          `
                SELECT * FROM tags
                WHERE id = $1
                LIMIT 1
            `,
          [id],
        )
      ).rows[0];
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async hasUserTag({ uid, tag_id }: AddTagToUserDto) {
    return !!(
      await this.database.query(
        `
            SELECT 
              user_uid
            FROM
              user_tag
            WHERE
              user_uid = $1 AND tag_id = $2
            LIMIT 1
          `,
        [uid, tag_id],
      )
    ).rows[0]
  }

  async addTagToUser({ uid, tag_id }: AddTagToUserDto) {
    try {

      if (await this.hasUserTag({ uid, tag_id })) {
        const errObj: IResponseFail = {
          status: false,
          message: 'У вас уже существует данный тэг',
        };

        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
      }

      return (
        await this.database.query(
          `
                INSERT INTO user_tag(user_uid, tag_id)
                VALUES($1, $2)
                RETURNING *
            `,
          [uid, tag_id],
        )
      ).rows[0];
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }
}
