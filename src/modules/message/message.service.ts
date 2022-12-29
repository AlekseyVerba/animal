import { Injectable, BadRequestException, HttpException } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer';
import { Messages } from './messages'

//DTO
import { RegistrationDto } from './dto/registration.dto';
import { RememberPasswordDto } from './dto/remember-password.dto';

//INTERFACES
import { IResponseFail } from 'src/types/response/index.interface';



@Injectable()
export class MessageService {
    constructor(private mailerService: MailerService) { }

    async registration({ code, email }: RegistrationDto): Promise<boolean> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'test',
                text: Messages.registration(code)
            })

            return true;
        } catch (err) {
            if (err.responseCode === 550) {
                const objError: IResponseFail = {
                    status: false,
                    message: 'Error sending email. Check if the mail is correct'
                }

                throw new BadRequestException(objError)
            }

            const objError: IResponseFail = {
                status: false,
                message: 'Error sending email. Try again'
            }

            throw new HttpException(objError, err.responseCode || err.status || 500)
        }
    }

    async rememberPassword({ code, email }: RememberPasswordDto): Promise<boolean> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'test',
                html: Messages.rememberPassword(code)
            })

            return true;
        } catch (err) {
            if (err.responseCode === 550) {
                const objError: IResponseFail = {
                    status: false,
                    message: 'Error sending email. Check if the mail is correct'
                }

                throw new BadRequestException(objError)
            }

            const objError: IResponseFail = {
                status: false,
                message: 'Error sending email. Try again'
            }

            throw new HttpException(objError, err.responseCode || err.status || 500)
        }
    }
}