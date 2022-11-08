import { Body, Controller, Post } from '@nestjs/common'
import { TokenService } from './token.service';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';

@Controller('token')
export class TokenController {
    constructor(
        private readonly tokenService: TokenService
    ) {}

}