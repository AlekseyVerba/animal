import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

//CONSTANTS
import { DATABASE_POOL } from 'src/constants/database.constants';

//DTO
import { AddLikeDto } from './dto/add-like.dto';
import { IsAddedDto } from './dto/is-added.dto';
import { DeleteLikeDto } from './dto/delete-like.dto';
import { IsAddedByIdDto } from './dto/is-added-by-id.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { IResponseFail } from 'src/types/response/index.interface';

@Injectable()
export class LikeService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  async isAddedById({ likeId, current_uid }: IsAddedByIdDto) {
    try {
      const like = (
        await this.database.query(
          `
              SELECT id FROM likes
              WHERE id = $1 AND user_uid = $2
              LIMIT 1
          `,
          [likeId, current_uid],
        )
      ).rows[0];

      return !!like;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async isAddedByCommentAndPost({
    commentId,
    postId,
    current_uid,
  }: IsAddedDto) {
    try {
      const like =
        (
          await this.database.query(
            `
            SELECT id FROM likes
            WHERE ((comment_id = $1 AND post_id IS NULL) OR (post_id = $2 AND comment_id IS NULL)) AND user_uid = $3
            LIMIT 1
        `,
            [commentId, postId, current_uid],
          )
        ).rows[0] || null;

      return !!like;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async addLike({ value, commentId, postId, current_uid }: AddLikeDto) {
    try {
      const like = await this.isAddedByCommentAndPost({
        commentId,
        postId,
        current_uid,
      });

      if (like) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Вы уже отреагировали',
        };
        throw new HttpException(errObj, HttpStatus.FORBIDDEN);
      }

      return (
        await this.database.query(
          `
              INSERT INTO likes(value, comment_id, post_id, user_uid)
              VALUES($1, $2, $3, $4)
              RETURNING *
          `,
          [value, commentId, postId, current_uid],
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

  async deleteLike({ commentId, postId, current_uid }: DeleteLikeDto) {
    try {
      const like = await this.isAddedByCommentAndPost({
        current_uid,
        commentId,
        postId,
      });

      if (!like) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Вы ещё не отреагировали',
        };
        throw new HttpException(errObj, HttpStatus.FORBIDDEN);
      }

      await this.database.query(
        `
              DELETE FROM likes
              WHERE ((comment_id = $2 AND post_id IS NULL) OR (post_id = $3 OR comment_id IS NULL)) AND user_uid = $1
          `,
        [current_uid, commentId, postId],
      );

      return true;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async updateLike({ current_uid, postId, value, commentId }: UpdateLikeDto) {
    try {
      const like = await this.isAddedByCommentAndPost({
        commentId,
        postId,
        current_uid,
      });

      if (!like) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Вы ещё не отреагировали',
        };
        throw new HttpException(errObj, HttpStatus.FORBIDDEN);
      }

      return (
        await this.database.query(
          `
              UPDATE likes
              SET value = $1
              WHERE ((comment_id = $3 AND post_id IS NULL) OR (post_id = $4 OR comment_id IS NULL)) AND user_uid = $2
              RETURNING *
          `,
          [value, current_uid, commentId, postId],
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

  async getLikes({
    postId,
    commentId,
    limit = 20,
    offset = 0,
    sort = '',
  }: {
    postId?: number;
    commentId?: number;
    limit?: number;
    offset?: number;
    sort?: string;
  }) {
    try {
      return (
        await this.database.query(
          `
              SELECT likes.id, value, post_id, comment_id,
                  json_build_object(
                      'uid', users.uid,
                      'name', users.name,
                      'avatars', json_build_object(
                          'small', user_avatar.small,
                          'middle', user_avatar.middle,
                          'large', user_avatar.large,
                          'default_avatar', user_avatar.default_avatar
                      )
                  ) as user
              FROM likes
              INNER JOIN users ON likes.user_uid = users.uid
              LEFT JOIN user_avatar ON user_avatar.user_uid = likes.user_uid
              WHERE 
                  (
                      (likes.post_id = $1 AND likes.comment_id IS NULL) 
                          OR 
                      (likes.post_id IS NULL AND likes.comment_id = $2)
                  )
                      AND 
  
                  value LIKE '%' || $5 || '%'
              LIMIT $3
              OFFSET $4
          `,
          [postId, commentId, limit, offset, sort],
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

  async getLike(id: number) {
    try {
      return (
        await this.database.query(
          `
              SELECT * FROM likes WHERE id = $1 LIMIT 1
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
}
