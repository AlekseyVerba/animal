import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Pool } from 'pg';

//CONSTANTS
import { DATABASE_POOL } from 'src/constants/database.constants';

//DTO
import { AddCommentDto } from './dto/add-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IsAuthorDto } from './dto/is-author.dto';

//SERVICES
import { UserService } from '../user/user.service';
import { IResponseFail } from 'src/types/response/index.interface';
import { PostService } from '../post/post.service';

@Injectable()
export class CommentService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,

    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  async addCommentToProject({
    value,
    current_uid,
    postId,
    parent_id,
    reply_uid,
  }: AddCommentDto) {
    try {
      if (parent_id) {
        const parentComment = await this.getCommentById(parent_id);

        if (parentComment.parent_id) {
          const errObj: IResponseFail = {
            status: false,
            message: 'Родительский комментарий не является родительским',
          };
          throw new HttpException(errObj, HttpStatus.NOT_ACCEPTABLE);
        }
      }

      const comment = (
        await this.database.query(
          `
              INSERT INTO comments(value, user_uid, post_id, parent_id, reply_uid)
              VALUES($1, $2, $3, $4, $5)
              RETURNING *;
          `,
          [value, current_uid, postId, parent_id, reply_uid],
        )
      ).rows[0];

      return await this.getCommenWithData(comment.id, current_uid);
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async getCommenWithData(id: number, current_uid?: string) {
    return (
      await this.database.query(
        `
            SELECT comments.id, value, post_id, created_at, updated_at, parent_id,
            json_build_object(
                'uid', users.uid,
                'name', users.name,
                'nickname', users.nickname,
                'avatars', json_build_object(
                    'small', user_avatar.small,
                    'middle', user_avatar.middle,
                    'large', user_avatar.large,
                    'default_avatar', user_avatar.default_avatar
                )
            ) as user,
                ${
                  current_uid
                  ?
                  `
                  json_build_object(
                    'value', (SELECT likes.value  FROM likes WHERE likes.comment_id = comments.id AND user_uid = '${current_uid}')
                  ) as isLiked,
                  `
                  :
                  ''
                }

                ARRAY(
                    SELECT json_build_object(
                        'count', count(*),
                        'value', value
                    )
                    FROM likes
                    WHERE likes.comment_id = comments.id
                    GROUP BY value, post_id
                ) as likes,

                (
                  SELECT json_build_object(
                    'uid', u.uid,
                    'name', u.name,
                    'nickname', u.nickname,
                    'avatars', json_build_object(
                        'small', uv.small,
                        'middle', uv.middle,
                        'large', uv.large,
                        'default_avatar', uv.default_avatar
                    )
                  )
                  FROM users u
                  LEFT JOIN user_avatar uv ON uv.user_uid = u.uid
                  WHERE reply_uid = u.uid
                  LIMIT 1
                ) as "replyUser",

                (SELECT COUNT(*)::integer FROM comments c WHERE c.parent_id = comments.id) as "countSubComments",
                COALESCE(
                  ARRAY(
                      SELECT
                          json_build_object(
                              'id', c.id,
                              'user', json_build_object(
                                'uid', users.uid,
                                'nickname', users.nickname,
                                'name', users.name,
                                'avatars', json_build_object(
                                    'small', user_avatar.small,
                                    'middle', user_avatar.middle,
                                    'large', user_avatar.large,
                                    'default_avatar', user_avatar.default_avatar
                                )
                              ),
                              'value', c.value,
                              ${
                                current_uid
                                ?
                                `'isLiked',json_build_object(
                                  'value', (SELECT likes.value  FROM likes WHERE likes.comment_id = c.id AND user_uid = '${current_uid}')
                                ),`
                                :
                                ''
                              }
                              'likes', ARRAY(
                                  SELECT json_build_object(
                                      'count', count(*),
                                      'value', value
                                  )
                                  FROM likes
                                  WHERE likes.comment_id = c.id
                                  GROUP BY value, post_id
                              )
                          )
                      FROM comments c
                      INNER JOIN users ON c.user_uid = users.uid
                      LEFT JOIN user_avatar ON user_avatar.user_uid = c.user_uid
                      WHERE c.parent_id = comments.id
                      ORDER BY c.created_at DESC
                      LIMIT 5
                  ) ,
                  '{}'
              ) as "subComments"

            FROM comments
            INNER JOIN users ON comments.user_uid = users.uid
            LEFT JOIN user_avatar ON user_avatar.user_uid = comments.user_uid
            WHERE comments.id = $1
        `,
        [id],
      )
    ).rows[0];
  }

  async updateComment({
    commentId,
    current_uid,
    value,
    reply_uid,
  }: UpdateCommentDto) {
    try {
      await this.isAuthorComment({ commentId, current_uid });

      const comment = (
        await this.database.query(
          `
              UPDATE comments
              SET value = $1, updated_at = NOW() ${
                reply_uid ? `, reply_uid = '${reply_uid}'` : ''
              }
              WHERE id = $2
              RETURNING *
          `,
          [value, commentId],
        )
      ).rows[0];

      return await this.getCommenWithData(comment.id, current_uid);
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async isAuthorComment({ commentId, current_uid }: IsAuthorDto) {
    try {
      const { user_uid, post_id } = (
        await this.database.query(
          `
              SELECT user_uid, post_id
              FROM comments
              WHERE id = $1
              LIMIT 1
          `,
          [commentId],
        )
      ).rows[0];

      if (user_uid !== current_uid) {
        try {
          await this.postService.isAuthor({ current_uid, postId: post_id });
        } catch {
          const errObj: IResponseFail = {
            status: false,
            message: 'У вас нету прав',
          };
          throw new HttpException(errObj, HttpStatus.FORBIDDEN);
        }
      }

      return true;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async deleteComment({ commentId, current_uid }) {
    try {
      await this.isAuthorComment({ commentId, current_uid });

      await this.database.query(
        `
              DELETE FROM comments
              WHERE id = $1
          `,
        [commentId],
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

  async getComments({
    postId,
    current_uid,
    limit = 20,
    offset = 0,
  }: {
    postId: number;
    current_uid?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      return (
        await this.database.query(
          `
              SELECT comments.id, value, post_id, created_at, updated_at, parent_id,
              json_build_object(
                  'uid', users.uid,
                  'name', users.name,
                  'nickname', users.nickname,
                  'avatars', json_build_object(
                      'small', user_avatar.small,
                      'middle', user_avatar.middle,
                      'large', user_avatar.large,
                      'default_avatar', user_avatar.default_avatar
                  )
              ) as user,
                  ${
                    current_uid
                    ?
                    `
                    json_build_object(
                      'value', (SELECT likes.value  FROM likes WHERE likes.comment_id = comments.id AND user_uid = '${current_uid}')
                    ) as isLiked,
                    `
                    :
                    ''
                  }

                  ARRAY(
                      SELECT json_build_object(
                          'count', count(*),
                          'value', value
                      )
                      FROM likes
                      WHERE likes.comment_id = comments.id
                      GROUP BY value, post_id
                  ) as likes,

                  (
                    SELECT json_build_object(
                      'uid', u.uid,
                      'name', u.name,
                      'nickname', u.nickname,
                      'avatars', json_build_object(
                          'small', uv.small,
                          'middle', uv.middle,
                          'large', uv.large,
                          'default_avatar', uv.default_avatar
                      )
                    )
                    FROM users u
                    LEFT JOIN user_avatar uv ON uv.user_uid = u.uid
                    WHERE reply_uid = u.uid
                    LIMIT 1
                  ) as "replyUser",

                  (SELECT COUNT(*)::integer FROM comments c WHERE c.parent_id = comments.id) as "countSubComments",
                  COALESCE(
                    ARRAY(
                        SELECT
                            json_build_object(
                                'id', c.id,
                                'user', json_build_object(
                                  'uid', users.uid,
                                  'nickname', users.nickname,
                                  'name', users.name,
                                  'avatars', json_build_object(
                                      'small', user_avatar.small,
                                      'middle', user_avatar.middle,
                                      'large', user_avatar.large,
                                      'default_avatar', user_avatar.default_avatar
                                  )
                                ),
                                'post_id', c.post_id,
                                'created_at', c.created_at,
                                'updated_at',c.updated_at,
                                'value', c.value,
                                'likes', ARRAY(
                                    SELECT json_build_object(
                                        'count', count(*),
                                        'value', value
                                    )
                                    FROM likes
                                    WHERE likes.comment_id = c.id
                                    GROUP BY value, post_id
                                ),
                                ${
                                  current_uid
                                  ?
                                  `'isLiked',json_build_object(
                                    'value', (SELECT likes.value  FROM likes WHERE likes.comment_id = c.id AND user_uid = '${current_uid}')
                                  ),`
                                  :
                                  ''
                                }

                                'replyUser', (
                                  SELECT json_build_object(
                                    'uid', u.uid,
                                    'name', u.name,
                                    'nickname', u.nickname,
                                    'avatars', json_build_object(
                                        'small', uv.small,
                                        'middle', uv.middle,
                                        'large', uv.large,
                                        'default_avatar', uv.default_avatar
                                    )
                                  )
                                  FROM users u
                                  LEFT JOIN user_avatar uv ON uv.user_uid = u.uid
                                  WHERE reply_uid = u.uid
                                  LIMIT 1
                                )
                            )
                        FROM comments c
                        INNER JOIN users ON c.user_uid = users.uid
                        LEFT JOIN user_avatar ON user_avatar.user_uid = c.user_uid
                        WHERE c.parent_id = comments.id
                        ORDER BY c.created_at DESC
                        LIMIT 5
                    ) ,
                    '{}'
                ) as "subComments"


              FROM comments
              INNER JOIN users ON comments.user_uid = users.uid
              LEFT JOIN user_avatar ON user_avatar.user_uid = comments.user_uid
              WHERE comments.post_id = $1 AND comments.parent_id IS NULL
              ORDER BY comments.created_at DESC
              LIMIT $2
              OFFSET $3
          `,
          [postId, limit, offset],
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

  async getCommentId(id: number) {
    try {
      return (
        await this.database.query(
          `
              SELECT id FROM
              comments
              WHERE comments.id = $1
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

  async getCommentById(id: number) {
    try {
      return (
        await this.database.query(
          `
              SELECT * FROM
              comments
              WHERE comments.id = $1
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

  async getSubComments({
    commentId,
    current_uid,
    limit = 20,
    offset = 0,
  }: {
    commentId: number;
    current_uid?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      return (
        await this.database.query(
          `
              SELECT comments.id, value, post_id, created_at, updated_at, parent_id,
              json_build_object(
                  'uid', users.uid,
                  'name', users.name,
                  'nickname', users.nickname,
                  'avatars', json_build_object(
                      'small', user_avatar.small,
                      'middle', user_avatar.middle,
                      'large', user_avatar.large,
                      'default_avatar', user_avatar.default_avatar
                  )
              ) as user,
              ${
                current_uid
                ?
                `
                json_build_object(
                  'value', (SELECT likes.value  FROM likes WHERE likes.comment_id = comments.id AND user_uid = '${current_uid}')
                ) as isLiked,
                `
                :
                ''
              }
              ARRAY(
                  SELECT json_build_object(
                      'count', count(*),
                      'value', value
                  )
                  FROM likes
                  WHERE likes.comment_id = comments.id
                  GROUP BY value, post_id
              ) as likes,

              (
                SELECT 
                
                  json_build_object(
                    'uid', u.uid,
                    'name', u.name,
                    'nickname', u.nickname,
                    'avatars', json_build_object(
                        'small', uv.small,
                        'middle', uv.middle,
                        'large', uv.large,
                        'default_avatar', uv.default_avatar
                    )
                  )

                FROM users u
                LEFT JOIN user_avatar uv ON uv.user_uid = u.uid
                WHERE reply_uid = u.uid
                LIMIT 1
              ) as "replyUser"

              FROM comments
              INNER JOIN users ON comments.user_uid = users.uid
              LEFT JOIN user_avatar ON user_avatar.user_uid = comments.user_uid
              WHERE comments.parent_id = $1
              ORDER BY comments.created_at DESC
              LIMIT $2
              OFFSET $3
          `,
          [commentId, limit, offset],
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
}
