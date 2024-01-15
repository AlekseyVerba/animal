import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Messages } from './messages';

//DTO
import { RegistrationDto } from './dto/registration.dto';
import { RememberPasswordDto } from './dto/remember-password.dto';

//INTERFACES
import { IResponseFail } from 'src/types/response/index.interface';

@Injectable()
export class MessageService {
  constructor(private mailerService: MailerService) {}

  registration({ code, email }: RegistrationDto): void {
    try {
      this.mailerService.sendMail({
        to: email,
        subject: 'test',
        text: Messages.registration(code),
      });
    } catch (err) {
      if (err.responseCode === 550) {
        const objError: IResponseFail = {
          status: false,
          message:
            'Ошибка при отправлении почтового сообщения. Проверьте корректность почтовой формы',
        };

        throw new BadRequestException(objError);
      }

      const objError: IResponseFail = {
        status: false,
        message:
          'Ошибка при отправлении почтового сообщения. Попробуйте ещё раз',
      };

      throw new HttpException(objError, err.responseCode || err.status || 500);
    }
  }

  rememberPassword({ code, email }: RememberPasswordDto): void {
    try {
      this.mailerService.sendMail({
        to: email,
        subject: 'test',
        html: Messages.rememberPassword(code),
      });
    } catch (err) {
      if (err.responseCode === 550) {
        const objError: IResponseFail = {
          status: false,
          message:
            'Ошибка при отправлении почтового сообщения. Проверьте корректность почтовой формы',
        };

        throw new BadRequestException(objError);
      }

      const objError: IResponseFail = {
        status: false,
        message:
          'Ошибка при отправлении почтового сообщения. Попробуйте ещё раз',
      };

      throw new HttpException(objError, err.responseCode || err.status || 500);
    }
  }
}
