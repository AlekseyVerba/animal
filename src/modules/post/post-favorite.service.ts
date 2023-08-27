import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

//PG
import { Pool } from 'pg';

//CONSTANTS
import { DATABASE_POOL } from 'src/constants/database.constants';

//INTERFACES
import { IResponseFail } from 'src/types/response/index.interface';

//DTO
import { GetMyFavoriteProjectsDTO } from './dto/get-my-favorite-projects.dto';

@Injectable()
export class PostFavoriteService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  async isAddedToFavorite(postId: number, current_uid: string) {
    try {
      const userPost = (
        await this.database.query(
          `
                  SELECT user_uid FROM user_post_favorite
                  WHERE post_id = $1 AND user_uid = $2
                  LIMIT 1
              `,
          [postId, current_uid],
        )
      ).rows[0];

      return !!userPost;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async addPostToFavorite({
    postId,
    current_uid,
  }: {
    postId: number;
    current_uid: string;
  }) {
    try {
      const isAdded = await this.isAddedToFavorite(postId, current_uid);

      if (isAdded) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Этот проект уже существует в избранном',
        };

        throw new HttpException(errObj, HttpStatus.CONFLICT);
      }

      const result = (
        await this.database.query(
          'INSERT INTO user_post_favorite(post_id, user_uid) VALUES ($1, $2) RETURNING *',
          [postId, current_uid],
        )
      ).rows[0];

      return result;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async deletePostFromFavorite({
    postId,
    current_uid,
  }: {
    postId: number;
    current_uid: string;
  }) {
    try {
      const isAdded = await this.isAddedToFavorite(postId, current_uid);

      if (!isAdded) {
        const errObj: IResponseFail = {
          status: false,
          message: 'Этот проект не существует в избранном',
        };

        throw new HttpException(errObj, HttpStatus.BAD_REQUEST);
      }

      await this.database.query(
        `
              DELETE FROM user_post_favorite
              WHERE post_id = $1 AND user_uid = $2
            `,
        [postId, current_uid],
      );
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async getMyFavoriteProjectsCount(current_uid: string) {
    return (
      await this.database.query(
        `
        SELECT 
          COUNT(*)
        FROM posts
        INNER JOIN user_post_favorite ON posts.id = user_post_favorite.post_id AND user_post_favorite.user_uid = '${current_uid}'
      `,
        [],
      )
    ).rows[0].count;
  }

  async getMyFavoriteProjects({
    current_uid,
    limit = 20,
    offset = 0,
  }: GetMyFavoriteProjectsDTO) {
    const [projects, count] = await Promise.all([
      this.database.query(
        `
                  SELECT 
                      posts.id as id, 
                      posts.title as title, 
                      posts.body as body,
                      posts.main_image as mainImage,
                      posts.created_at as createdAt, 
                      posts.updated_at as updatedAt, 
                      CASE 
                      WHEN pets.id IS NOT NULL
                        THEN json_build_object(
                          'type', 'pet',
                          'id',pets.id,
                          'avatars',json_build_object(
                              'small',pet_avatar.small,
                              'middle',pet_avatar.middle,
                              'large',pet_avatar.large,
                              'default_avatar',pet_avatar.default_avatar
                          ),
                          'name',pets.name
                      )
                      ELSE json_build_object(
                        'type', 'user',
                        'uid',users.uid,
                        'avatars',json_build_object(
                            'small',user_avatar.small,
                            'middle',user_avatar.middle,
                            'large',user_avatar.large,
                            'default_avatar',user_avatar.default_avatar
                        ),
                        'name',users.name
                    )
                    END AS profile,
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
                  INNER JOIN user_post_favorite ON posts.id = user_post_favorite.post_id AND user_post_favorite.user_uid = '${current_uid}'
                  LEFT JOIN pets ON pets.id = posts.pet_id
                  LEFT JOIN users on users.uid = posts.user_uid
                  LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
                  LEFT JOIN post_tag ON post_tag.post_id = posts.id
                  LEFT JOIN tags ON tags.id = post_tag.tag_id
                  LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
                  GROUP BY posts.id, pets.id, pet_avatar.small, pet_avatar.middle, pet_avatar.large, pet_avatar.default_avatar, users.uid, user_avatar.small, user_avatar.middle, user_avatar.large, user_avatar.default_avatar, user_post_favorite.created_at
                  ORDER BY user_post_favorite.created_at 
                  LIMIT $1
                  OFFSET $2
              `,
        [limit, offset],
      ),
      this.getMyFavoriteProjectsCount(current_uid),
    ]);

    return {
      projects: projects.rows,
      count,
    };
  }
}
