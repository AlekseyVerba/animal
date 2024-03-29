import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from 'src/constants/database.constants';
import { IResponseFail } from 'src/types/response/index.interface';

//DTO
import { FollowAndUnfollowProfileDto } from './dto/followAndUnfollowProfile';
import { GetFollowingUsersDto } from './dto/getFollowingUsers.dto';
import { LimitOffsetDto } from './dto/limitOffset.dto';
import { GetProfileFollowersDto } from './dto/getProfileFollowers.dto';

@Injectable()
export class ProfileService {
  tableUserUserFollowers = {
    name: 'user_user_followers',
    followerUserNameRow: 'follower_uid',
    profileNameRow: 'user_uid',
  };
  tableUserPetFollowers = {
    name: 'user_pet_followers',
    followerUserNameRow: 'follower_uid',
    profileNameRow: 'pet_id',
  };

  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  async followToProfile({
    current_uid,
    profile,
    profile_type,
  }: FollowAndUnfollowProfileDto) {
    if (current_uid === profile) {
      const errObj: IResponseFail = {
        status: false,
        message: 'Вы не можете подписаться на себя',
      };

      throw new ConflictException(errObj);
    }

    const table = this.getNameTableCurrentTable(profile_type);

    const isCurrectUserFollowToUser =
      await this.checkUserFollowedToAnotherProfile({
        current_uid,
        profile,
        profile_type,
      });

    if (isCurrectUserFollowToUser) {
      const errObj: IResponseFail = {
        status: false,
        message: 'Текущий пользователь уже подписан на данный профиль',
      };

      throw new ConflictException(errObj);
    }

    await this.database.query(
      `
              INSERT INTO ${table.name}(${table.followerUserNameRow}, ${table.profileNameRow})
              VALUES($1, $2)
          `,
      [current_uid, profile],
    );

    return true;
  }

  async unfollowFromProfile({
    current_uid,
    profile,
    profile_type,
  }: FollowAndUnfollowProfileDto) {
    if (current_uid === profile) {
      const errObj: IResponseFail = {
        status: false,
        message: 'Вы не можете отписаться от себя',
      };

      throw new ConflictException(errObj);
    }

    const table = this.getNameTableCurrentTable(profile_type);

    const isCurrectUserFollowToUser =
      await this.checkUserFollowedToAnotherProfile({
        current_uid,
        profile,
        profile_type,
      });

    if (!isCurrectUserFollowToUser) {
      const errObj: IResponseFail = {
        status: false,
        message: 'Данный пользователь не подписан на этот профиль',
      };

      throw new ConflictException(errObj);
    }

    await this.database.query(
      `
              DELETE FROM ${table.name}
              WHERE ${table.followerUserNameRow} = $1 AND ${table.profileNameRow} = $2
          `,
      [current_uid, profile],
    );

    return true;
  }

  async checkUserFollowedToAnotherProfile({
    current_uid,
    profile,
    profile_type,
  }: FollowAndUnfollowProfileDto) {
    const table = await this.getNameTableCurrentTable(profile_type);

    return !!(
      await this.database.query(
        `
              SELECT * FROM ${table.name}
              WHERE ${table.followerUserNameRow} = $1 AND ${table.profileNameRow} = $2
              LIMIT 1
          `,
        [current_uid, profile],
      )
    ).rows[0];
  }

  getNameTableCurrentTable(profile_type: 'user' | 'pet') {
    return profile_type === 'user'
      ? this.tableUserUserFollowers
      : this.tableUserPetFollowers;
  }

  async getProfilePet(
    pet_id: number,
    current_uid: string | undefined = undefined,
  ) {
    const result = (
      await this.database.query(
        `
          SELECT pets.id, pets.name, pets.bio, pets.date_of_birthday,
          json_build_object(
              'uid',users.uid,
              'name',users.name,
              'avatars',json_build_object(
                  'small',user_avatar.small,
                  'middle',user_avatar.middle,
                  'large',user_avatar.large,
                  'default_avatar',user_avatar.default_avatar
              )
          ) AS user,
          json_build_object(
              'small',pet_avatar.small,
              'middle',pet_avatar.middle,
              'large',pet_avatar.large,
              'default_avatar',pet_avatar.default_avatar
          ) AS avatars,
          json_build_object(
              'id',tags_type.id,
              'name',tags_type.name
          ) AS type,
          json_build_object(
              'id',tags_breed.id,
              'name',tags_breed.name
          ) AS breed,
          (SELECT COUNT(*) FROM user_pet_followers WHERE pet_id = $1) as followers_count
          FROM pets
          INNER JOIN users ON pets.user_uid = users.uid
          LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
          LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
          INNER JOIN tags tags_type ON pets.type = tags_type.id
          LEFT JOIN tags tags_breed ON pets.breed = tags_breed.id
          WHERE pets.id = $1
          GROUP BY 
              pets.id, pets.name, users.uid, 
              user_avatar.small, user_avatar.middle, user_avatar.large, user_avatar.default_avatar,
              pet_avatar.small, pet_avatar.middle, pet_avatar.large, pet_avatar.default_avatar,
              tags_type.id, tags_breed.id
      `,
        [pet_id],
      )
    ).rows[0];

    result.isSubscribed = false;

    if (current_uid) {
      const isSubscribed = (
        await this.database.query(
          `
              SELECT follower_uid FROM user_pet_followers
              WHERE pet_id = $1 AND follower_uid = $2
              LIMIT 1
          `,
          [pet_id, current_uid],
        )
      ).rows[0];

      if (isSubscribed) {
        result.isSubscribed = true;
      }
    }

    return result;
  }

  async getProfileUser(
    user_uid: string,
    current_uid: string | undefined = undefined,
  ) {
    const result = (
      await this.database.query(
        `
              SELECT 
                  users.uid, users.name,users.nickname, users.bio,users.country, users.city, users.email,
                  json_build_object(
                      'small',user_avatar.small,
                      'middle',user_avatar.middle,
                      'large',user_avatar.large,
                      'default_avatar',user_avatar.default_avatar
                  ) AS avatars,

                  COALESCE(
                      ARRAY_AGG(
                          CASE WHEN pets.id IS NOT NULL THEN
                              json_build_object(
                                  'id', pets.id,
                                  'name', pets.name,
                                  'type', json_build_object(
                                      'id', tags_type.id,
                                      'name', tags_type.name
                                  ),
                                  'breed', json_build_object(
                                      'id', tags_breed.id,
                                      'name', tags_breed.name
                                  ),
                                  'avatars', json_build_object(
                                      'small', pet_avatar.small,
                                      'middle', pet_avatar.middle,
                                      'large', pet_avatar.large,
                                      'default_avatar', pet_avatar.default_avatar
                                  ),
                                    'followers_count', (SELECT COUNT(*) FROM user_pet_followers WHERE user_pet_followers.pet_id = pets.id)
                              )
                          END
                      ) FILTER (WHERE pets.id IS NOT NULL),
                      '{}'
                  ) as pets,
                  (SELECT COUNT(*) FROM user_user_followers WHERE user_uid = $1) as followers_count,
                  (SELECT COUNT(*) FROM user_user_followers WHERE follower_uid = $1) + (SELECT COUNT(*) FROM user_pet_followers WHERE follower_uid = $1) as following_count 

              FROM users
              LEFT JOIN pets ON pets.user_uid = users.uid
              LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
              LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
              LEFT JOIN tags tags_type ON pets.type = tags_type.id
              LEFT JOIN tags tags_breed ON pets.breed = tags_breed.id
              WHERE users.uid = $1
              GROUP BY users.uid, user_avatar.small, user_avatar.middle, user_avatar.large, user_avatar.default_avatar
          `,
        [user_uid],
      )
    ).rows[0];

    result.isSubscribed = false;

    if (current_uid) {
      const isSubscribed = (
        await this.database.query(
          `
                  SELECT user_uid FROM user_user_followers
                  WHERE user_uid = $1 AND follower_uid = $2
                  LIMIT 1
              `,
          [user_uid, current_uid],
        )
      ).rows[0];

      if (isSubscribed) {
        result.isSubscribed = true;
      }
    }

    return result;
  }

  async getUsersCountsFollowing(uid: string) {
    const result = (
      await this.database.query(
        `
          SELECT
          (SELECT COUNT(*) FROM user_user_followers WHERE follower_uid = $1) as following_users,
          (SELECT COUNT(*) FROM user_pet_followers WHERE follower_uid = $1) as following_pets 
          `,
        [uid],
      )
    ).rows[0];

    return result;
  }

  async getFollowingUsersCount({ user_uid }: GetFollowingUsersDto) {
    return (
      await this.database.query(
        `
          SELECT COUNT(*)
          FROM users
          INNER JOIN user_user_followers ON users.uid = user_user_followers.user_uid
          LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
          WHERE user_user_followers.follower_uid = $1
          `,
        [user_uid],
      )
    ).rows[0].count;
  }

  async getFollowingUsers({
    uid,
    limit = 10,
    offset = 0,
    user_uid,
  }: GetFollowingUsersDto & LimitOffsetDto) {
    const [users, count] = await Promise.all([
      this.database.query(
        `
          SELECT uid, name, nickname,
              json_build_object(
                  'small',user_avatar.small,
                  'middle',user_avatar.middle,
                  'large',user_avatar.large,
                  'default_avatar',user_avatar.default_avatar
              ) AS avatars,
              CASE 
                  WHEN (SELECT COUNT(*) FROM user_user_followers WHERE user_user_followers.user_uid = users.uid AND user_user_followers.follower_uid = $2) > 0 THEN true
                  ELSE false
              END as is_subscribed
          FROM users
          INNER JOIN user_user_followers ON users.uid = user_user_followers.user_uid
          LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
          WHERE user_user_followers.follower_uid = $1
          ORDER BY user_user_followers.created DESC
          LIMIT $3
          OFFSET $4
          `,
        [user_uid, uid, limit, offset],
      ),
      this.getFollowingUsersCount({ uid, user_uid }),
    ]);

    return {
      users: users.rows,
      count,
    };
  }

  async getFollowingPetsCount({ user_uid }: GetFollowingUsersDto) {
    return (
      await this.database.query(
        `
          SELECT COUNT(*)
          FROM pets
          INNER JOIN user_pet_followers ON pets.id = user_pet_followers.pet_id
          LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
          WHERE user_pet_followers.follower_uid = $1
          `,
        [user_uid],
      )
    ).rows[0].count;
  }

  async getFollowingPets({
    user_uid,
    uid,
    limit,
    offset,
  }: GetFollowingUsersDto & LimitOffsetDto) {
    const [pets, count] = await Promise.all([
      this.database.query(
        `
          SELECT pets.id, name,
              json_build_object(
                  'small',pet_avatar.small,
                  'middle',pet_avatar.middle,
                  'large',pet_avatar.large,
                  'default_avatar',pet_avatar.default_avatar
              ) AS avatars,
              CASE 
                  WHEN (SELECT COUNT(*) FROM user_pet_followers WHERE user_pet_followers.pet_id = pets.id AND user_pet_followers.follower_uid = $2) > 0 THEN true
                  ELSE false
              END as is_subscribed
          FROM pets
          INNER JOIN user_pet_followers ON pets.id = user_pet_followers.pet_id
          LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
          WHERE user_pet_followers.follower_uid = $1
          ORDER BY user_pet_followers.created DESC
          LIMIT $3
          OFFSET $4
          `,
        [user_uid, uid, limit, offset],
      ),
      this.getFollowingPetsCount({ uid, user_uid }),
    ]);

    return {
      pets: pets.rows,
      count,
    };
  }

  async getProfileFollowersCount({
    user_uid,
    pet_id,
    uid,
  }: GetProfileFollowersDto) {
    let queryResult;

    if (user_uid) {
      queryResult = await this.database.query(
        `
        SELECT COUNT(*)
        FROM users
        INNER JOIN user_user_followers ON users.uid = user_user_followers.follower_uid
        LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
        WHERE user_user_followers.user_uid = $1
      `,
        [user_uid],
      );
    } else {
      queryResult = await this.database.query(
        `
        SELECT COUNT(*)
        FROM users
        INNER JOIN user_pet_followers ON users.uid = user_pet_followers.follower_uid
        LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
        WHERE user_pet_followers.pet_id = $1
      `,
        [pet_id],
      );
    }

    return queryResult.rows[0].count;
  }

  async getProfileFollowers(
    { user_uid, pet_id, uid }: GetProfileFollowersDto,
    { limit = 20, offset = 0 }: LimitOffsetDto,
  ) {
    let queryResult;

    if (user_uid) {
      queryResult = await this.database.query(
        `
        SELECT uid, name, nickname,
          json_build_object(
              'small',user_avatar.small,
              'middle',user_avatar.middle,
              'large',user_avatar.large,
              'default_avatar',user_avatar.default_avatar
          ) AS avatars,
          CASE 
              WHEN (SELECT COUNT(*) FROM user_user_followers WHERE user_user_followers.user_uid = users.uid AND user_user_followers.follower_uid = $2) > 0 THEN true
              ELSE false
          END as is_subscribed
        FROM users
        INNER JOIN user_user_followers ON users.uid = user_user_followers.follower_uid
        LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
        WHERE user_user_followers.user_uid = $1
        ORDER BY user_user_followers.created DESC
        LIMIT $3
        OFFSET $4
      `,
        [user_uid, uid, limit, offset],
      );
    } else {
      queryResult = await this.database.query(
        `
        SELECT uid, name, nickname,
          json_build_object(
              'small',user_avatar.small,
              'middle',user_avatar.middle,
              'large',user_avatar.large,
              'default_avatar',user_avatar.default_avatar
          ) AS avatars,
          CASE 
              WHEN (SELECT COUNT(*) FROM user_user_followers WHERE user_user_followers.user_uid = users.uid AND user_user_followers.follower_uid = $2) > 0 THEN true
              ELSE false
          END as is_subscribed
        FROM users
        INNER JOIN user_pet_followers ON users.uid = user_pet_followers.follower_uid
        LEFT JOIN user_avatar ON users.uid = user_avatar.user_uid
        WHERE user_pet_followers.pet_id = $1
        ORDER BY user_pet_followers.created DESC
        LIMIT $3
        OFFSET $4
      `,
        [pet_id, uid, limit, offset],
      );
    }

    return {
      followers: queryResult.rows,
      count: await this.getProfileFollowersCount({ user_uid, pet_id, uid }),
    };
  }
}
