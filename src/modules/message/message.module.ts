import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

@Module({
    imports: [
        MailerModule.forRoot({
            // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
            // or
            transport: {
              host: 'smtp.mail.ru',
              secure: false,
              auth: {
                user: 'verba.20@bk.ru',
                pass: 'ibNZeQLiXe4ZrSwz6HuA',
              },
            },
            defaults: {
              from: '<verba.20@bk.ru>',
            }
          }),
        ],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule {}