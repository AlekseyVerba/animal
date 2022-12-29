import { Body, Controller, Delete, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { IResponseSuccess } from "src/types/response/index.interface";
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

//CONFIGS
import { CheckUserApiResponse, CheckUserByEmailApiBody } from './configs/check-user-by-email.config'

//DTO
import { CheckUserByEmailDto } from './dto/checkUserByEmail.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';

@UsePipes(new ValidationPipe())
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @ApiOperation({ summary: 'Check exist user by email' })
    @ApiBody(CheckUserByEmailApiBody)
    @ApiResponse(CheckUserApiResponse)
    @Post('check-user-by-email')
    async isUserExistByEmail(@Body() {email}: CheckUserByEmailDto): Promise<boolean> {
        return await this.userService.isUserExistByEmail(email);
    }

    @Delete(':userUid')
    async deleteUser(@Param() { userUid }: DeleteUserDto): Promise<IResponseSuccess<void>> {
        await this.userService.deleteUser(userUid);

        return {
            status: true,
            message: `User with uid - ${userUid} deleted successfully`
        };
    }
}