import { ConflictException, HttpException, Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { DATABASE_POOL } from "src/constants/database.constants";
import { IResponseFail } from "src/types/response/index.interface";

//DTO
import { FollowAndUnfollowProfileDto } from './dto/followAndUnfollowProfile';

@Injectable()
export class ProfileService {

    tableUserUserFollowers = {
        name: 'user_user_followers',
        followerUserNameRow: 'follower_uid',
        profileNameRow: 'user_uid'
    }
    tableUserPetFollowers = {
        name: 'user_pet_followers',
        followerUserNameRow: 'follower_uid',
        profileNameRow: 'pet_id'
    }

    constructor(
        @Inject(DATABASE_POOL)
        private readonly database: Pool,
    ) { }

    async followToProfile({ current_uid, profile, profile_type }: FollowAndUnfollowProfileDto) {
        try {

            if (current_uid === profile) {
                const errObj: IResponseFail = {
                    status: false,
                    message: 'You can not follow to yourself',
                }

                throw new ConflictException(errObj)
            }

            const table = this.getNameTableCurrentTable(profile_type)

            const isCurrectUserFollowToUser = await this.checkUserFollowedToAnotherProfile({
                current_uid,
                profile,
                profile_type
            })

            if (isCurrectUserFollowToUser) {
                const errObj: IResponseFail = {
                    status: false,
                    message: 'Current user has already subscribed to this profile',
                }

                throw new ConflictException(errObj)
            }

            await this.database.query(`
                INSERT INTO ${table.name}(${table.followerUserNameRow}, ${table.profileNameRow})
                VALUES($1, $2)
            `, [current_uid, profile])


            return true
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async unfollowFromProfile({ current_uid, profile, profile_type }: FollowAndUnfollowProfileDto) {
        try {

            if (current_uid === profile) {
                const errObj: IResponseFail = {
                    status: false,
                    message: 'You can not unfollow from yourself',
                }

                throw new ConflictException(errObj)
            }

            const table = this.getNameTableCurrentTable(profile_type)

            const isCurrectUserFollowToUser = await this.checkUserFollowedToAnotherProfile({
                current_uid,
                profile,
                profile_type
            })

            if (!isCurrectUserFollowToUser) {
                const errObj: IResponseFail = {
                    status: false,
                    message: 'Current user is not subscribed to this profile',
                }

                throw new ConflictException(errObj)
            }

            await this.database.query(`
                DELETE FROM ${table.name}
                WHERE ${table.followerUserNameRow} = $1 AND ${table.profileNameRow} = $2
            `, [current_uid, profile])


            return true
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    async checkUserFollowedToAnotherProfile({ current_uid, profile, profile_type }: FollowAndUnfollowProfileDto) {
        try {
            const table = await this.getNameTableCurrentTable(profile_type)

            return !!(await this.database.query(`
                SELECT * FROM ${table.name}
                WHERE ${table.followerUserNameRow} = $1 AND ${table.profileNameRow} = $2
                LIMIT 1
            `, [current_uid, profile])).rows[0]
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

    getNameTableCurrentTable(profile_type: 'user' | 'pet') {
        return profile_type === 'user' ? this.tableUserUserFollowers : this.tableUserPetFollowers
    }

    async getProfilePet(pet_id: number) {
        try {
            const result = (await this.database.query(`
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
        `, [pet_id])).rows[0]

        return result
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }

            throw new HttpException(errObj, err.status || 500);
        }

    }

    async getProfileUser(user_uid: string) {
        try {
            const result = (await this.database.query(`
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
                                    )
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
            `, [user_uid])).rows[0]

            return result
        } catch(err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            }

            throw new HttpException(errObj, err.status || 500);
        }
    }

}