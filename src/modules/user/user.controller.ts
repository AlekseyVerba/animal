import { Body, Controller, Delete, HttpException, HttpStatus, Param, ParseFilePipe, ParseFilePipeBuilder, Post, Put, UploadedFile, UseGuards, UseInterceptors, UsePipes } from "@nestjs/common";
import { IResponseSuccess } from "src/types/response/index.interface";
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from "@nestjs/platform-express";
import { fileFilter } from 'src/modules/file/file.filter';

//CONFIGS
import { CheckUserApiResponse, CheckUserByEmailApiBody } from './configs/check-user-by-email.config'
import { UpdateUserApiBody } from './configs/update-user.config';

//DTO
import { CheckUserByEmailDto } from './dto/checkUserByEmail.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { AuthGuard } from "src/guards/auth.guard";
import { UserProperty } from "src/decorators/userProperty.decorator";
import { UpdateUserDto } from './dto/updateUser.dto';

//PIPES
import { ValidationPipe } from 'src/pipes/validation.pipe';

@ApiTags('User')
@UsePipes(new ValidationPipe())
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @ApiOperation({ summary: 'Check exist user by email' })
    @ApiBody(CheckUserByEmailApiBody)
    @ApiResponse(CheckUserApiResponse)
    @Post('check-user-by-email')
    async isUserExistByEmail(@Body() { email }: CheckUserByEmailDto): Promise<boolean> {
        return await this.userService.isUserExistByEmail(email);
    }

    @ApiOperation({ summary: 'Delete user' })
    @UseGuards(AuthGuard)
    @Delete(':userUid')
    async deleteUser(@Param() { userUid }: DeleteUserDto): Promise<IResponseSuccess<void>> {
        await this.userService.deleteUser(userUid);

        return {
            status: true,
            message: `User with uid - ${userUid} deleted successfully`
        };
    }

    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Update user' })
    @ApiBody(UpdateUserApiBody)
    @UseInterceptors(FileInterceptor('avatar', {
        fileFilter: fileFilter(/\/(jpg|jpeg|png)$/)
    }))
    @Put('')
    async updateUser(
        @UserProperty('uid') uid: string,
        @Body() dto: UpdateUserDto,
        @UploadedFile() avatar: Express.Multer.File
    ) {
        dto.uid = uid
        dto.avatar = avatar

        return await this.userService.updateUser(dto)
    }
}