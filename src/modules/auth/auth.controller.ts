import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

//SERVICES
import { AuthService } from './auth.service';

//CONFIGS
import { CheckAuthApiResponse } from './configs/check-auth.config';
import {
  ChangePasswordApiBody,
  ChangePasswordApiResponse,
} from './configs/change-password.config';
import {
  RegistrationApiBody,
  RegistrationApiResponse,
} from './configs/registration.config';
import {
  RegistrationConfirmTokenApiResponse,
  RegistrationConfirmTokenApiBody,
} from './configs/confirm-token-for-registration.config';
import {
  AuthorizationApiBody,
  AuthorizationApiResponse,
} from './configs/authorization.config';
import {
  RememberPasswordApiBody,
  RememberPasswordApiResponse,
} from './configs/remember-password.config';

//GUARDS
import { AuthGuard } from '../../guards/auth.guard';

//DTO
import { RegistrationDto } from './dto/registration.dto';
import { RegistrationConfirmDto } from './dto/registration-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { RememberPasswordDto } from './dto/remember-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

//DECORATORS
import { UserProperty } from 'src/decorators/userProperty.decorator';

//INTERFACES
import { IResponseSuccess } from '../../types/response/index.interface';

//PIPES
import { ValidationPipe } from 'src/pipes/validation.pipe';

@UsePipes(new ValidationPipe())
@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Проверка авторизации' })
  @ApiBearerAuth('Bearer token')
  @ApiResponse(CheckAuthApiResponse)
  @Get('/check')
  @UseGuards(AuthGuard)
  async authCheck(
    @UserProperty('uid') uid: string,
  ): Promise<IResponseSuccess<any>> {
    const result = await this.authService.authCheck(uid);
    return {
      status: true,
      message: 'Пользователь успешно верифицирован',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiBody(ChangePasswordApiBody)
  @ApiResponse(ChangePasswordApiResponse)
  @Post('/change-password/')
  async changePassword(
    @Body() dto: ChangePasswordDto,
  ): Promise<IResponseSuccess<void>> {
    await this.authService.changePassword(dto);

    return {
      status: true,
      message: 'Пароль был успешно изменен',
    };
  }

  @ApiOperation({ summary: 'Регистрация' })
  @ApiBody(RegistrationApiBody)
  @ApiResponse(RegistrationApiResponse)
  @Post('registration')
  async registration(
    @Body() dto: RegistrationDto,
  ): Promise<IResponseSuccess<string>> {
    const result = await this.authService.registration(dto);

    return {
      status: true,
      message: 'На вашу почту был отправлен код. Необходимо подтверждение',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Подтверждение кода регистрации' })
  @ApiBody(RegistrationConfirmTokenApiBody)
  @ApiResponse(RegistrationConfirmTokenApiResponse)
  @Post('registration/confirm')
  async confirmRegistration(
    @Body() dto: RegistrationConfirmDto,
  ): Promise<IResponseSuccess<any>> {
    const result = await this.authService.confirmRegistration(dto);
    return {
      status: true,
      message: 'Пользователь успешно верифицирован',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Авторизация' })
  @ApiBody(AuthorizationApiBody)
  @ApiResponse(AuthorizationApiResponse)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<IResponseSuccess<any>> {
    const result = await this.authService.login(dto);
    return {
      status: true,
      message: 'Success',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Вспомнить пароль' })
  @ApiBody(RememberPasswordApiBody)
  @ApiResponse(RememberPasswordApiResponse)
  @Post('remember-password')
  async rememberPassword(
    @Body() dto: RememberPasswordDto,
  ): Promise<IResponseSuccess<void>> {
    await this.authService.rememberPassword(dto.email);

    return {
      status: true,
      message: 'На вашу почту был отправлен код. Необходимо подтверждение',
    };
  }
}
