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

  async registration({ code, email }: RegistrationDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'test',
        text: Messages.registration(code),
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  async rememberPassword({ code, email }: RememberPasswordDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'test',
        html: Messages.rememberPassword(code),
      });
    } catch (err) {
      console.log(err.message);
    }
  }
}
