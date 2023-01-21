import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, UsePipes } from "@nestjs/common";
import { PetService } from './pet.service';
import { CreateAndUpdatePetDto } from './dto/createPet.dto';
import { fileFilter } from "../file/file.filter";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserProperty } from "src/decorators/userProperty.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreatePetApiBody } from './configs/create-pet.config';

@ApiTags('Pet')
@UsePipes(new ValidationPipe())
@Controller('pet')
export class PetController {
    constructor(
        private readonly petService: PetService
    ) {}

    @ApiOperation({ summary: 'Create a pet' })
    @ApiBody(CreatePetApiBody)
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('avatar', {
        fileFilter: fileFilter(/\/(jpg|jpeg|png)$/)
    }))
    @Post('create')
    async create(
        @UserProperty('uid') uid: string,
        @Body() dto: CreateAndUpdatePetDto,
        @UploadedFile() avatar: Express.Multer.File
    ) {
        dto.user_uid = uid
        dto.avatar = avatar

        const data = await this.petService.create(dto)

        return {
            status: true,
            data
        }
    }
}