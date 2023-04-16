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

@Injectable()
export class CommentService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,

    private readonly userService: UserService,
  ) {}

  async addCommentToProject({ value, current_uid, postId }: AddCommentDto) {
    const comment = (
      await this.database.query(
        `
            INSERT INTO comments(value, user_uid, post_id)
            VALUES($1, $2, $3)
            RETURNING *;
        `,
        [value, current_uid, postId],
      )
    ).rows[0];

    return comment;
  }

  async updateComment({ commentId, current_uid, value }: UpdateCommentDto) {
    await this.isAuthorComment({ commentId, current_uid });

    const comment = (
      await this.database.query(
        `
            UPDATE comments
            SET value = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `,
        [value, commentId],
      )
    ).rows[0];

    return comment;
  }

  async isAuthorComment({ commentId, current_uid }: IsAuthorDto) {
    const { user_uid } = (
      await this.database.query(
        `
            SELECT user_uid 
            FROM comments
            WHERE id = $1
            LIMIT 1
        `,
        [commentId],
      )
    ).rows[0];

    if (user_uid !== current_uid) {
      throw new HttpException('У вас нету прав', HttpStatus.FORBIDDEN);
    }

    return true;
  }

  async deleteComment({ commentId, current_uid }) {
    await this.isAuthorComment({ commentId, current_uid });

    await this.database.query(
      `
            DELETE FROM comments
            WHERE id = $1
        `,
      [commentId],
    );

    return true;
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
    return (
      await this.database.query(
        `
            SELECT comments.id, value, post_id, created_at, updated_at, 
            json_build_object(
                'uid', users.uid,
                'name', users.name,
                'avatars', json_build_object(
                    'small', user_avatar.small,
                    'middle', user_avatar.middle,
                    'large', user_avatar.large,
                    'default_avatar', user_avatar.default_avatar
                )
            ) as user,
                (SELECT 
                json_build_object(
                    'value', likes.value
                )
                FROM likes WHERE likes.comment_id = comments.id AND user_uid = $2) as isLiked,
                ARRAY(
                    SELECT json_build_object(
                        'count', count(*),
                        'value', value
                    )
                    FROM likes
                    WHERE likes.comment_id = comments.id
                    GROUP BY value, post_id
                ) as likes
            FROM comments
            INNER JOIN users ON comments.user_uid = users.uid
            LEFT JOIN user_avatar ON user_avatar.user_uid = comments.user_uid
            WHERE comments.post_id = $1
            ORDER BY comments.created_at DESC
            LIMIT $3
            OFFSET $4
        `,
        [postId, current_uid, limit, offset],
      )
    ).rows;
  }

  async getCommentId(id: number) {
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
  }
}
