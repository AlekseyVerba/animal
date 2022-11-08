import { Body, Controller, Delete, Param, Post } from "@nestjs/common";
import { IResponseSuccess } from "src/types/response/index.interface";
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

//CONFIGS
import { CheckUserApiResponse, CheckUserByEmailApiBody } from './configs/check-user-by-email.config'

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @ApiOperation({ summary: 'Check exist user by email' })
    @ApiBody(CheckUserByEmailApiBody)
    @ApiResponse(CheckUserApiResponse)
    @Post('check-user-by-email')
    async isUserExistByEmail(@Body('email') email: string): Promise<boolean> {
        return await this.userService.isUserExistByEmail(email);
    }

    @Delete(':userUid')
    async deleteUser(@Param('userUid') userUid: string): Promise<IResponseSuccess<void>> {
        const result = await this.userService.deleteUser(userUid);
        return {
            status: true,
            message: `Пользователь с uid - ${userUid} успешно удален`
        };
    }
}