import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer';
import { Messages } from './messages'

//DTO
import { RegistrationDto } from './dto/registration.dto';
import { RememberPasswordDto } from './dto/remember-password.dto';

@Injectable()
export class MessageService {
    constructor(private mailerService: MailerService) {}

    async registration({ code, email }: RegistrationDto): Promise<boolean> {
        const result = await this.mailerService.sendMail({
            to: email,
            subject: 'test',
            text: Messages.registration(code)
        })

        return true;
    }

    async rememberPassword({ code, email }: RememberPasswordDto): Promise<boolean> {
        const result = await this.mailerService.sendMail({
            to: email,
            subject: 'test',
            html: Messages.rememberPassword(code)
        })

        return true;
    }
}