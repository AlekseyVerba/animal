import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

//SERVICES
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

//DTOS
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDTO } from './dto/delete-message.dto';
import { GetMessagesDTO } from './dto/get-messages.dto';
import { GetMessagesQuery } from './dto/get-messages.query';
import { ReadMessagesDTO } from './dto/read-messages.dto';
import { DeleteDialogDTO } from './dto/delete-dialog.dto';

//GUARDS
import { AuthGuard } from 'src/guards/auth.guard';

//DECORATORS
import { UserProperty } from 'src/decorators/userProperty.decorator';

//SWAGGER
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Чат')
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @ApiOperation({
    summary: `Получить чаты. Получаем последние чаты и последнее сообщение. 
    Отправителя сравнивать по свойствам author и partner`,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'По умолчанию: 20',
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
    description: 'По умолчанию: 0',
  })
  @Get('all')
  async getChats(
    @Query() query: GetMessagesQuery,
    @UserProperty('uid') current_uid: string,
  ) {
    return {
      status: true,
      data: await this.chatService.getChats(current_uid, query),
    };
  }

  @ApiOperation({ summary: `Получить сообщения с пользователем` })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'По умолчанию: 20',
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
    description: 'По умолчанию: 0',
  })
  @Post('partner')
  async getMessages(
    @Body() dto: GetMessagesDTO,
    @UserProperty('uid') current_uid: string,
    @Query() query: GetMessagesQuery,
  ) {
    dto.uid = current_uid;

    return {
      status: true,
      data: await this.chatService.getMessages(dto, query),
    };
  }

  @ApiOperation({
    summary: `Прочитать последние сообщения от пользователя. Отправлять сюда запрос каждый раз как открываешь чат`,
  })
  @Post('partner/read')
  async readMessages(
    @Body() dto: ReadMessagesDTO,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.uid = current_uid;

    const messages = await this.chatService.readMessages(dto);

    if (messages.length) {
      this.chatGateway.readMessages(messages);
    }

    return {
      status: true,
    };
  }

  @ApiOperation({
    summary: `
        Создать сообщение. 
        Так же данный метод поддерживает файлы, передавать с любыми ключами.
        При создании сообщение будет приходить через сокеты
    `,
  })
  @UseInterceptors(AnyFilesInterceptor())
  @Post('/message/create')
  async createMessage(
    @Body() dto: CreateMessageDto,
    @UserProperty('uid') current_uid: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    dto.uid = current_uid;
    const message = await this.chatService.createMessage(dto, files);
    this.chatGateway.createMessage(message);

    return {
      status: true,
    };
  }

  @ApiOperation({ summary: `Удалить сообщение` })
  @Delete('message/delete')
  async deleteMessage(
    @Body() dto: DeleteMessageDTO,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.uid = current_uid;
    const messages = await this.chatService.deleteMessage(dto);

    if (messages[0]) {
      this.chatGateway.deleteMessage(messages[0]);
    }

    return {
      status: true,
    };
  }

  @ApiOperation({
    summary: `Удалить диалог (удаляем только у того, кто отправил запрос)`,
  })
  @Delete('dialog/delete')
  async deleteDialog(
    @Body() dto: DeleteDialogDTO,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.uid = current_uid;

    await this.chatService.deleteDialog(dto);

    return {
      status: true,
    };
  }
}
