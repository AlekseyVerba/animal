import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";

//CONSTANTS
import { DATABASE_POOL } from "src/constants/database.constants";

//INTERFACES
import { IResponseFail } from "src/types/response/index.interface";

//DTOS
import { CreateMessageDto } from './dto/create-message.dto'
import { DeleteMessageDTO } from './dto/delete-message.dto'
import { GetMessagesDTO } from './dto/get-messages.dto'
import { GetMessagesQuery } from './dto/get-messages.query'
import { ReadMessagesDTO } from './dto/read-messages.dto'

//SERVICES
import { FileService } from '../file/file.service'

@Injectable()
export class ChatService {
    constructor(
        @Inject(DATABASE_POOL)
        private readonly database: Pool,
        private readonly fileService: FileService
    ) { }

    async readMessages({ partnerUid, uid }: ReadMessagesDTO) {
        await this.database.query(`
            UPDATE messages
            SET is_read = true
            WHERE author_uid = $2 AND partner_uid = $1 AND is_read = false
        `, [uid, partnerUid])

        return true
    }

    async deleteMessage({ uid, id, partner = false }: DeleteMessageDTO) {
        try {
            const isAuthor = await this.isAuthor(uid, id)

            if (!isAuthor) {
                const errObj: IResponseFail = {
                    status: false,
                    message: 'Вы не автор данного сообщения',
                };

                throw new HttpException(errObj, HttpStatus.FORBIDDEN);
            }

            await this.database.query(`
                UPDATE messages
                SET deleted_author = NOW() ${partner ? ', deleted_partner = NOW()' : ''}
                WHERE id = $1
            `, [id])
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            };
            throw new HttpException(errObj, err.status || 500);
        }
    }

    async isAuthor(uid: string, id: number) {
        return !!(await this.database.query(`
            SELECT 
                id 
            FROM messages
            WHERE 
                id = $1
                AND
                author_uid = $2
            LIMIT 1 
        `, [id, uid])).rows[0]
    }

    async createMessage({ uid, partner_uid, value, reply_id }: CreateMessageDto, files: Array<Express.Multer.File>) {
        try {
            const message = (
                await this.database.query(
                    'INSERT INTO messages(reply_id, author_uid, partner_uid, value) VALUES ($1, $2, $3, $4) RETURNING *',
                    [reply_id, uid, partner_uid, value],
                )
            ).rows[0];

            if (files && files.length) {
                const filesUploaded = (await Promise.all(files.map(async file => {
                    const type = this.fileService.getTypeOfFile(file)
                    const value = await this.fileService.createFile(file, 'messagesFiles')
                    return {
                        type,
                        value: value.fullPath,
                        preview_value: this.fileService.isImage(type) ? (await this.fileService.createResizedImage(value, 90, {
                            height: 128,
                            width: 128
                        })).split('assets/')[1] : null
                    }
                }))).map(file => {
                    return `(${message.id},'${file.value}', ${file.preview_value ? `'${file.preview_value}'` : 'null'}, '${file.type}')`
                })

                await this.database.query(
                    `INSERT INTO message_file(id_message, value, preview_value, type) VALUES ${filesUploaded.join(',')}`,
                    [],
                )

                return await this.getMessage(message.id)
            }

        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            };
            throw new HttpException(errObj, err.status || 500);
        }
    }

    async getMessage(id: number) {
        try {

            return (await this.database.query(`
                SELECT 
                    messages.id,
                    messages.value,
                    messages.created_at,
                    messages.is_read,
                    json_build_object(
                        'id', message_reply.id,
                        'value', message_reply.value
                    ) as reply_message,

                    ARRAY(
                        SELECT json_build_object(
                            'id', message_file.id,
                            'type', message_file.type,
                            'value', message_file.value,
                            'preview_value', message_file.preview_value
                        )
                        FROM message_file
                        WHERE message_file.id_message = messages.id
                    ) as files,

                    json_build_object(
                       'uid', users_auth.uid,
                       'name', users_auth.name,
                       'nickname', users_auth.nickname,
                       'avatars', json_build_object(
                            'small',user_avatar_auth.small
                        )
                    ) as author,
                    json_build_object(
                        'uid', users_partner.uid,
                        'name', users_partner.name,
                        'nickname', users_partner.nickname,
                        'avatars', json_build_object(
                            'small',user_avatar_partner.small
                        )
                    ) as partner,
                    ARRAY(
                        SELECT json_build_object(
                            'count', count(*),
                            'value', value
                        )
                        FROM likes
                        WHERE likes.message_id = messages.id
                        GROUP BY value, message_id
                    ) as likes
                FROM messages
                INNER JOIN users users_auth ON users_auth.uid = messages.author_uid
                INNER JOIN users users_partner ON users_partner.uid = messages.partner_uid
                LEFT JOIN user_avatar user_avatar_auth ON users_auth.uid = user_avatar_auth.user_uid
                LEFT JOIN user_avatar user_avatar_partner ON users_partner.uid = user_avatar_partner.user_uid
                LEFT JOIN messages message_reply ON message_reply.id = messages.reply_id
                WHERE messages.id = $1
                GROUP BY 
                    messages.id, 
                    users_auth.uid, 
                    user_avatar_auth.small, 
                    users_partner.uid, 
                    user_avatar_partner.small,
                    message_reply.id
                LIMIT 1
            `, [id])).rows[0]

        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            };
            throw new HttpException(errObj, err.status || 500);
        }
    }

    async isMessageExistsById(id: number) {
        try {
            const candidate = (
                await this.database.query(
                    `
                      SELECT id FROM messages
                      WHERE id = $1 AND deleted_author IS NULL
                      LIMIT 1
                  `,
                    [id],
                )
            ).rows[0];

            return candidate ? true : false;
        } catch (err) {
            const errObj: IResponseFail = {
                status: false,
                message: err.message,
            };
            throw new HttpException(errObj, err.status || 500);
        }
    }

    async getMessages({ uid, partnerUid }: GetMessagesDTO, { limit = 20, offset = 0 }: GetMessagesQuery) {
        return (await this.database.query(`
            SELECT 
                messages.id,
                messages.value,
                messages.created_at,
                messages.is_read,
                json_build_object(
                    'id', message_reply.id,
                    'value', message_reply.value
                ) as reply_message,

                ARRAY(
                    SELECT json_build_object(
                        'id', message_file.id,
                        'type', message_file.type,
                        'value', message_file.value,
                        'preview_value', message_file.preview_value
                    )
                    FROM message_file
                    WHERE message_file.id_message = messages.id
                ) as files,

                json_build_object(
                'uid', users_auth.uid,
                'name', users_auth.name,
                'nickname', users_auth.nickname,
                'avatars', json_build_object(
                        'small',user_avatar_auth.small
                    )
                ) as author,
                json_build_object(
                    'uid', users_partner.uid,
                    'name', users_partner.name,
                    'nickname', users_partner.nickname,
                    'avatars', json_build_object(
                        'small',user_avatar_partner.small
                    )
                ) as partner,
                ARRAY(
                    SELECT json_build_object(
                        'count', count(*),
                        'value', value
                    )
                    FROM likes
                    WHERE likes.message_id = messages.id
                    GROUP BY value, message_id
                ) as likes
            FROM messages
            INNER JOIN users users_auth ON users_auth.uid = messages.author_uid
            INNER JOIN users users_partner ON users_partner.uid = messages.partner_uid
            LEFT JOIN user_avatar user_avatar_auth ON users_auth.uid = user_avatar_auth.user_uid
            LEFT JOIN user_avatar user_avatar_partner ON users_partner.uid = user_avatar_partner.user_uid
            LEFT JOIN messages message_reply ON message_reply.id = messages.reply_id
            WHERE 
                (messages.author_uid = $1 AND messages.partner_uid = $2 AND messages.deleted_author IS NULL)
                    OR
                (messages.author_uid = $2 AND messages.partner_uid = $1 AND messages.deleted_partner IS NULL)
            GROUP BY 
                messages.id, 
                users_auth.uid, 
                user_avatar_auth.small, 
                users_partner.uid, 
                user_avatar_partner.small,
                message_reply.id
            ORDER BY created_at DESC
            LIMIT $3
            OFFSET $4
        `, [uid, partnerUid, limit, offset])).rows
    }

    async getChats(uid: string, { limit = 20, offset = 0 }: GetMessagesQuery) {
        return (await this.database.query(`
            SELECT
                messages.id,
                messages.value,
                messages.created_at,
                messages.is_read,
                json_build_object(
                    'uid', users_auth.uid,
                    'name', users_auth.name,
                    'nickname', users_auth.nickname,
                    'avatars', json_build_object(
                        'small',user_avatar_auth.small
                    )
                ) as author,
                json_build_object(
                    'uid', users_partner.uid,
                    'name', users_partner.name,
                    'nickname', users_partner.nickname,
                    'avatars', json_build_object(
                        'small',user_avatar_partner.small
                    )
                ) as partner
            FROM messages
            INNER JOIN users users_auth ON users_auth.uid = messages.author_uid
            INNER JOIN users users_partner ON users_partner.uid = messages.partner_uid
            LEFT JOIN user_avatar user_avatar_auth ON users_auth.uid = user_avatar_auth.user_uid
            LEFT JOIN user_avatar user_avatar_partner ON users_partner.uid = user_avatar_partner.user_uid
            INNER JOIN 
            (
                SELECT MAX(id) as lastid
                FROM  messages m
                    WHERE
                    (
                        m.author_uid = $1
                        OR 
                        m.partner_uid = $1
                    )
                GROUP BY 
                CONCAT(
                    LEAST(m.author_uid, m.partner_uid),
                    '.',
                    GREATEST(m.author_uid, m.partner_uid)
                )
            ) conversations 
            ON conversations.lastid = messages.id
            
            ORDER BY
            messages.created_at DESC
            LIMIT $2
            OFFSET $3
        `, [uid, limit, offset])).rows
    }
}
