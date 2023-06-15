import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

//SERVICES
import { FileService } from '../file/file.service';

//CONSTANTS
import { DATABASE_POOL } from 'src/constants/database.constants';

//DTO
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DeletePostDto } from './dto/delete-post.dto';
import { IsAuthorDto } from './dto/is-author.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { IResponseFail } from 'src/types/response/index.interface';

@Injectable()
export class PostService {
  #NAME_NEW_IMAGE: string;
  #NAME_PROPERTY_IMAGE: string;

  constructor(
    private readonly fileService: FileService,
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {
    this.#NAME_NEW_IMAGE = 'newImage';
    this.#NAME_PROPERTY_IMAGE = 'textImage';
  }

  async createPost(
    files: Array<Express.Multer.File>,
    { body, pet_id, title, tags, current_uid, main_image }: CreatePostDto,
  ) {
    try {
      const isMasterPet = (
        await this.database.query(
          `
              SELECT * FROM pets
              WHERE pets.id = $2 AND pets.user_uid = $1
              LIMIT 1
          `,
          [current_uid, pet_id],
        )
      ).rows[0];

      if (!isMasterPet) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Вы не владелец этого питомца',
        };

        throw new HttpException(errObj, HttpStatus.FORBIDDEN);
      }

      if (files) {
        files.forEach((file) => {
          file.fieldname.includes(this.#NAME_NEW_IMAGE)
            ? (body[
                `${file.fieldname.match(/\d+/)[0]}${this.#NAME_PROPERTY_IMAGE}`
              ] = this.fileService.createFile(file, 'project').fullPath)
            : null;
        });
      }

      if (main_image) {
        main_image = body[main_image] || undefined;
      }

      const post = (
        await this.database.query(
          'INSERT INTO posts(title, body, pet_id, main_image) VALUES ($1, $2, $3, $4) RETURNING *',
          [title, body, pet_id, main_image],
        )
      ).rows[0];

      if (tags && tags.length) {
        const existTags = await Promise.all(
          tags.map(async (tag) => {
            return {
              tag_id: (
                await this.database.query(
                  `
              
                      WITH ins AS (
                          INSERT INTO tags (name)
                          VALUES ($1)
                          ON CONFLICT (name) DO NOTHING
                          RETURNING *
                        )
                        SELECT * FROM ins
                        UNION
                        SELECT * FROM tags
                      WHERE name = $1;
          
                      `,
                  [tag],
                )
              ).rows[0],
              post_id: post.id,
            };
          }),
        );

        console.log(existTags);

        await this.bulkCreatePostTags(existTags);
      }

      return post;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async bulkCreatePostTags(values: { tag_id: any; post_id: number }[]) {
    try {
      await this.database.query(`
      INSERT INTO post_tag(post_id, tag_id) VALUES 
      ${values
        .map((value) => '(' + `${value.post_id}` + ', ' + value.tag_id.id + ')')
        .join(', ')} 
  `);
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async isAuthor({ current_uid, postId }: IsAuthorDto) {
    try {
      const post = (
        await this.database.query(
          `
              SELECT posts.id,pet_id FROM posts
              INNER JOIN pets ON pets.id = posts.pet_id
              WHERE posts.id = $1 AND pets.user_uid = $2
              LIMIT 1
          `,
          [postId, current_uid],
        )
      ).rows[0];

      if (!post) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Вы не являетесь автором этого поста',
        };

        throw new HttpException(errObj, HttpStatus.FORBIDDEN);
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

  async updatePost(
    files: Array<Express.Multer.File>,
    { body, title, id, current_uid, main_image }: UpdatePostDto,
  ) {
    try {
      await this.isAuthor({ postId: id, current_uid });

      if (files) {
        files.forEach((file) => {
          file.fieldname.includes(this.#NAME_NEW_IMAGE)
            ? (body[
                `${file.fieldname.match(/\d+/)[0]}${this.#NAME_PROPERTY_IMAGE}`
              ] = this.fileService.createFile(file, 'project').fullPath)
            : null;
        });
      }

      if (main_image) {
        main_image = body[main_image] || undefined;
      }

      const post = (
        await this.database.query(
          `
              SELECT * FROM posts
              WHERE id = $1
              LIMIT 1
          `,
          [id],
        )
      ).rows[0];

      const value = (
        await this.database.query(
          `
              UPDATE posts
              SET title = $2, body = $3, main_image = $4, updated_at = NOW()
              WHERE id = $1
          `,
          [id, title || post.title, body, main_image || post.main_image],
        )
      ).rows[0];

      return value;
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    }
  }

  async deletePost({ current_uid, postId }: DeletePostDto) {
    try {
      await this.isAuthor({ postId, current_uid });

      const { body } = (
        await this.database.query(
          `
              SELECT body FROM posts
              WHERE id = $1
              LIMIT 1
          `,
          [postId],
        )
      ).rows[0];

      Object.keys(body).forEach((key) => {
        if (key.includes(this.#NAME_PROPERTY_IMAGE)) {
          this.fileService.deleteFile(body[key]);
        }
      });

      await this.database.query(
        `
              DELETE FROM posts
              WHERE id = $1
          `,
        [postId],
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

  async getPosts({
    search = '',
    orderBy = 'like',
    order = 'ASC',
    offset = 0,
    limit = 20,
    pet_id,
    current_uid,
  }: GetPostsDto) {
    try {
      let orderByText;

      switch (orderBy) {
        case 'date':
          orderByText = 'posts.created_at';
          break;
        case 'like':
          orderByText = '(SELECT COUNT(*) FROM likes WHERE post_id = posts.id)';
      }

      return (
        await this.database.query(
          `
              SELECT 
                  posts.id as id, 
                  posts.title as title, 
                  posts.body as body,
                  posts.main_image as mainImage,
                  posts.created_at as createdAt, 
                  posts.updated_at as updatedAt, 
                  json_build_object(
                      'id',pets.id,
                      'avatars',json_build_object(
                          'small',pet_avatar.small,
                          'middle',pet_avatar.middle,
                          'large',pet_avatar.large,
                          'default_avatar',pet_avatar.default_avatar
                      ),
                      'name',pets.name
                  ) AS pet,
                  COALESCE(
                      ARRAY_AGG(
                          CASE WHEN tags.id IS NOT NULL THEN
                              json_build_object(
                                  'id', tags.id,
                                  'name', tags.name
                              )
                          END
                      ) FILTER (WHERE tags.id IS NOT NULL),
                      '{}'
                  ) as tags,
                  ${
                    current_uid
                      ? `
                    json_build_object(
                      'value', (SELECT 
                        CASE WHEN EXISTS 
                      (
                        SELECT user_post_favorite.post_id
                        FROM user_post_favorite
                        WHERE user_post_favorite.post_id = posts.id 
                        AND user_uid = '${current_uid}'
                      )
                      THEN TRUE
                      ELSE FALSE
                    END)
                    ) as isAddedToFavorite,
                  json_build_object(
                    'value', (SELECT likes.value  FROM likes WHERE likes.post_id = posts.id AND user_uid = '${current_uid}')
                  ) as isLiked,
              `
                      : ``
                  }
                  (SELECT COUNT(*)::integer FROM comments WHERE post_id = posts.id) as countComments,
                  (SELECT COUNT(*)::integer FROM post_views WHERE post_id = posts.id) as countViews,
                  ARRAY(
                      SELECT json_build_object(
                          'count', count(*),
                          'value', value
                      )
                      FROM likes
                      WHERE likes.post_id = posts.id
                      GROUP BY value, post_id
                  ) as likes
              FROM posts
              LEFT JOIN post_tag ON post_tag.post_id = posts.id
              LEFT JOIN tags ON tags.id = post_tag.tag_id
              INNER JOIN pets ON pets.id = posts.pet_id
              LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
              WHERE 
                  (
                      posts.title LIKE '%' || $1 || '%' 
                      OR 
                      posts.body::text LIKE '%' || $1 || '%' 
                      OR 
                      pets.name LIKE '%' || $1 || '%'
                      OR
                      tags.name LIKE '%' || $1 || '%'
                  )
                      
                  ${pet_id ? `AND posts.pet_id = ${pet_id}` : ''}
              GROUP BY posts.id, pets.id, pet_avatar.small, pet_avatar.middle, pet_avatar.large, pet_avatar.default_avatar
              ORDER BY ${orderByText} ${order}
              LIMIT $2
              OFFSET $3
          `,
          [search, limit, offset],
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

  async getPost({
    postId,
    current_uid,
  }: {
    postId: number;
    current_uid?: string;
  }) {
    try {
      if (current_uid) {
        const isCurrentUserView = (
          await this.database.query(
            `
                  SELECT * FROM post_views
                  WHERE post_id = $1 AND user_uid = $2
                  LIMIT 1
              `,
            [postId, current_uid],
          )
        ).rows[0];

        if (!isCurrentUserView) {
          await this.database.query(
            `
                      INSERT INTO post_views(post_id, user_uid)
                      VALUES($1,$2)
                  `,
            [postId, current_uid],
          );
        }
      }

      return (
        await this.database.query(
          `
              SELECT 
              posts.id as id, 
              posts.title as title, 
              posts.body as body,
              posts.main_image as mainImage,
              posts.created_at as createdAt, 
              posts.updated_at as updatedAt,
              json_build_object(
                  'id',pets.id,
                  'avatars',json_build_object(
                      'small',pet_avatar.small,
                      'middle',pet_avatar.middle,
                      'large',pet_avatar.large,
                      'default_avatar',pet_avatar.default_avatar
                  ),
                  'name',pets.name
              ) AS pet,
              COALESCE(
                  ARRAY(
                      SELECT
                          json_build_object(
                              'id', comments.id,
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
                              'post_id', comments.post_id,
                              'created_at', comments.created_at,
                              'updated_at',comments.updated_at,
                              'value', comments.value,
                              'likes', ARRAY(
                                  SELECT json_build_object(
                                      'count', count(*),
                                      'value', value
                                  )
                                  FROM likes
                                  WHERE likes.comment_id = comments.id
                                  GROUP BY value, post_id
                              ),
                              'isLiked',json_build_object(
                                'value', (SELECT likes.value  FROM likes WHERE likes.comment_id = comments.id AND user_uid = $2)
                              ),
                              'subComments',(SELECT COUNT(*)::integer FROM comments c WHERE c.parent_id = comments.id)
                          )
                      FROM comments
                      INNER JOIN users ON comments.user_uid = users.uid
                      LEFT JOIN user_avatar ON user_avatar.user_uid = comments.user_uid
                      WHERE comments.post_id = $1 AND comments.parent_id IS NULL
                      ORDER BY comments.created_at DESC
                      LIMIT 15
                  ) ,
                  '{}'
              ) as comments,
              ARRAY(
                  SELECT json_build_object(
                      'count', count(*),
                      'value', value
                  )
                  FROM likes
                  WHERE likes.post_id = posts.id
                  GROUP BY value, post_id
              ) as likes,
              COALESCE(
                  ARRAY_AGG(
                      CASE WHEN tags.id IS NOT NULL THEN
                          json_build_object(
                              'id', tags.id,
                              'name', tags.name
                          )
                      END
                  ) FILTER (WHERE tags.id IS NOT NULL),
                  '{}'
              ) as tags,
              (SELECT COUNT(*)::integer FROM comments WHERE post_id = $1) as countComments,
            ${
              current_uid
                ? `
                      json_build_object(
                        'value', (SELECT 
                          CASE WHEN EXISTS 
                        (
                          SELECT user_post_favorite.post_id
                          FROM user_post_favorite
                          WHERE user_post_favorite.post_id = posts.id 
                          AND user_uid = '${current_uid}'
                        )
                        THEN TRUE
                        ELSE FALSE
                      END)
                      ) as isAddedToFavorite,
                    json_build_object(
                      'value', (SELECT likes.value  FROM likes WHERE likes.post_id = posts.id AND user_uid = '${current_uid}')
                    ) as isLiked,
                `
                : ``
            }
          (SELECT COUNT(*)::integer FROM post_views WHERE post_id = $1) as countViews

          FROM posts
          LEFT JOIN post_tag ON post_tag.post_id = posts.id
          LEFT JOIN tags ON tags.id = post_tag.tag_id
          INNER JOIN pets ON pets.id = posts.pet_id
          LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
          WHERE posts.id = $1
          GROUP BY posts.id, pets.id, pet_avatar.small, pet_avatar.middle, pet_avatar.large, pet_avatar.default_avatar    
          `,
          [postId, current_uid],
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

  async getPostShort(id: number) {
    try {
      return (
        await this.database.query(
          `
              SELECT id FROM posts
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
}
