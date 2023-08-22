import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';

//SERVICES
import { ChatService } from './chat.service';

//CONSTANTS
import { DATABASE_POOL } from 'src/constants/database.constants';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinToChat')
  async joinToChat(socket: Socket, { partnerUid }: { partnerUid: string }) {
    const user = await this.chatService.getUserFromSocket(socket);
    const roomName = this.chatService.getIdFromUids(user.uid, partnerUid);
    await socket.join(roomName);
    console.log(`user ${user.uid} is connected to room - ${roomName}`);
  }

  @SubscribeMessage('writing')
  async writing(socket: Socket, { partnerUid }: { partnerUid: string }) {
    const user = await this.chatService.getUserFromSocket(socket);
    const roomName = this.chatService.getIdFromUids(user.uid, partnerUid);

    await this.server.in(roomName).emit('writing', { uid: user.uid });
  }

  afterInit(server: Server) {
    // this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Client disconnected: ${client.id}`);
  }

  async createMessage(message: any) {
    const roomName = this.chatService.getIdFromUids(
      message.author.uid,
      message.partner.uid,
    );
    console.log(`new message in room - ${roomName}`);
    await this.server.in(roomName).emit('new_message', message);
  }

  async deleteMessage(message: any) {
    const roomName = this.chatService.getIdFromUids(
      message.author_uid,
      message.partner_uid,
    );
    console.log(`delete message in room - ${roomName}`);
    await this.server.in(roomName).emit('delete_message', message);
  }

  async readMessages(
    messages: {
      id: number;
      author_uid: string;
      partner_uid: string;
      is_read: boolean;
    }[],
  ) {
    const roomName = this.chatService.getIdFromUids(
      messages[0].author_uid,
      messages[0].partner_uid,
    );
    console.log(`read messages in room - ${roomName}`);
    await this.server.in(roomName).emit('read_messages', messages);
  }

  async addLike(likeId: number) {
    const like = (
      await this.database.query(
        `
            SELECT 
                likes.id as like_id,
                user_uid,
                messages.id as message_id,
                likes.value as like_value,
                messages.id as message_id, 
                author_uid, 
                partner_uid
            FROM likes
            INNER JOIN messages ON likes.message_id = messages.id
            WHERE likes.id = $1
            LIMIT 1
        `,
        [likeId],
      )
    ).rows[0];

    const roomName = this.chatService.getIdFromUids(
      like.author_uid,
      like.partner_uid,
    );
    console.log(`add like in room - ${roomName}`);
    await this.server.in(roomName).emit('add_like', like);
  }

  async deleteLike(like: any) {
    const message = (
      await this.database.query(
        `
            SELECT 
                author_uid, 
                partner_uid
            FROM messages
                WHERE id = $1
            LIMIT 1
        `,
        [like.message_id],
      )
    ).rows[0];

    const roomName = this.chatService.getIdFromUids(
      message.author_uid,
      message.partner_uid,
    );
    console.log(`delete like in room - ${roomName}`);

    await this.server.in(roomName).emit('delete_like', like);
  }

  async updateLike(likeId: number) {
    const like = (
      await this.database.query(
        `
            SELECT 
                likes.id as like_id,
                user_uid,
                messages.id as message_id,
                likes.value as like_value,
                messages.id as message_id, 
                author_uid, 
                partner_uid
            FROM likes
            INNER JOIN messages ON likes.message_id = messages.id
            WHERE likes.id = $1
            LIMIT 1
        `,
        [likeId],
      )
    ).rows[0];

    const roomName = this.chatService.getIdFromUids(
      like.author_uid,
      like.partner_uid,
    );
    console.log(`update like in room - ${roomName}`);
    await this.server.in(roomName).emit('update_like', like);
  }

  async handleConnection(socket: Socket, ...args: any[]) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      console.log(`user ${user.uid} is connected`);
    } catch (err) {
      return {
        status: false,
        message: err.message,
      };
    }
  }
}
