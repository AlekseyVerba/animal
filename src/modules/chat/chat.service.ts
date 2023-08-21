import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

//CONSTANTS
import { DATABASE_POOL } from 'src/constants/database.constants';

//INTERFACES
import { IResponseFail } from 'src/types/response/index.interface';
import { IUserForToken } from '../../types/user';

//DTOS
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDTO } from './dto/delete-message.dto';
import { GetMessagesDTO } from './dto/get-messages.dto';
import { GetMessagesQuery } from './dto/get-messages.query';
import { ReadMessagesDTO } from './dto/read-messages.dto';

//SERVICES
import { FileService } from '../file/file.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
    private readonly fileService: FileService,
  ) {}

  async readMessages({ partnerUid, uid }: ReadMessagesDTO) {
    return (
      await this.database.query(
        `
            UPDATE messages
            SET is_read = true
            WHERE author_uid = $2 AND partner_uid = $1 AND is_read = false
            RETURNING id, is_read, author_uid, partner_uid
        `,
        [uid, partnerUid],
      )
    ).rows;
  }

  async deleteMessage({ uid, id, partner = false }: DeleteMessageDTO) {
    const isAuthor = await this.isAuthor(uid, id);

    if (!isAuthor) {
      const errObj: IResponseFail = {
        status: false,
        message: 'Вы не автор данного сообщения',
      };

      throw new HttpException(errObj, HttpStatus.FORBIDDEN);
    }

    return (
      await this.database.query(
        `
            UPDATE messages
            SET deleted_author = NOW() ${
              partner ? ', deleted_partner = NOW()' : ''
            }
            WHERE id = $1
            RETURNING id, author_uid, partner_uid, deleted_author, deleted_partner
        `,
        [id],
      )
    ).rows;
  }

  async isAuthor(uid: string, id: number) {
    return !!(
      await this.database.query(
        `
            SELECT 
                id 
            FROM messages
            WHERE 
                id = $1
                AND
                author_uid = $2
            LIMIT 1 
        `,
        [id, uid],
      )
    ).rows[0];
  }

  async createMessage(
    { uid, partner_uid, value, reply_id }: CreateMessageDto,
    files: Array<Express.Multer.File>,
  ) {
    const message = (
      await this.database.query(
        'INSERT INTO messages(reply_id, author_uid, partner_uid, value) VALUES ($1, $2, $3, $4) RETURNING *',
        [reply_id, uid, partner_uid, value],
      )
    ).rows[0];

    if (files && files.length) {
      const filesUploaded = (
        await Promise.all(
          files.map(async (file) => {
            const type = this.fileService.getTypeOfFile(file);
            const value = await this.fileService.createFile(
              file,
              'messagesFiles',
            );
            return {
              type,
              value: value.fullPath,
              preview_value: this.fileService.isImage(type)
                ? (
                    await this.fileService.createResizedImage(value, 90, {
                      height: 128,
                      width: 128,
                    })
                  ).split('assets/')[1]
                : null,
            };
          }),
        )
      ).map((file) => {
        return `(${message.id},'${file.value}', ${
          file.preview_value ? `'${file.preview_value}'` : 'null'
        }, '${file.type}')`;
      });

      await this.database.query(
        `INSERT INTO message_file(id_message, value, preview_value, type) VALUES ${filesUploaded.join(
          ',',
        )}`,
        [],
      );
    }

    return await this.getMessage(message.id);
  }

  async getMessage(id: number) {
    return (
      await this.database.query(
        `
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
        `,
        [id],
      )
    ).rows[0];
  }

  async isMessageExistsById(id: number) {
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
  }

  async getMessagesCount({ uid, partnerUid }: GetMessagesDTO) {
    return (
      await this.database.query(
        `
            SELECT 
                COUNT(*)
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
        `,
        [uid, partnerUid],
      )
    ).rows[0].count;
  }

  async getMessages(
    { uid, partnerUid }: GetMessagesDTO,
    { limit = 20, offset = 0 }: GetMessagesQuery,
  ) {
    const [messages, count] = await Promise.all([
      this.database.query(
        `
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
                ORDER BY messages.created_at DESC
                LIMIT $3
                OFFSET $4
            `,
        [uid, partnerUid, limit, offset],
      ),
      this.getMessagesCount({ uid, partnerUid }),
    ]);

    return {
      messages: messages.rows,
      count,
    };
  }

  async getChatsCount(uid: string) {
    return (
      await this.database.query(
        `
            SELECT
                COUNT(*)
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
        `,
        [uid],
      )
    ).rows[0].count;
  }

  async getChats(uid: string, { limit = 20, offset = 0 }: GetMessagesQuery) {
    const [chats, count] = await Promise.all([
      this.database.query(
        `
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
        `,
        [uid, limit, offset],
      ),
      this.getChatsCount(uid),
    ]);

    return {
      chats: chats.rows,
      count,
    };
  }

  async getUserFromSocket(socket: Socket) {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('Необходимо передать токен');
    }

    try {
      const user = verify(token, process.env.JWT_SECRET) as IUserForToken;

      if (!user) {
        throw new Error('Неверный токен');
      }

      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  getIdFromUids(firstUid: string, secondUid: string) {
    return [firstUid, secondUid].sort().join('');
  }
}
