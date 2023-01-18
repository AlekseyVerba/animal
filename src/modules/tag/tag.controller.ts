import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from "@nestjs/common";
import { UserProperty } from "src/decorators/userProperty.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { TagService } from './tag.service';

//DTO
import { AddTagToUserDto } from './dto/add-tag-to-user.dto';
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";

//CONFIGS
import { AddTagToUserApiBody } from './configs/addTagToUser.config';

//PIPES
import { ValidationPipe } from 'src/pipes/validation.pipe';

@UseGuards(AuthGuard)
@ApiTags('Tag')
@UsePipes(new ValidationPipe())
@Controller('tag')
export class TagController {
    constructor(
        private readonly tagService: TagService
    ) {}
    
    @ApiOperation({ summary: 'Get all parent tags' })
    @Get('all-parent')
    async getAllParentTags() {
        const data = await this.tagService.getAllParentTags();

        return {
            status: true,
            data
        }
    }

    @ApiOperation({ summary: 'Get all child tags from parent tag' })
    @Get(':parent_id/childs')
    async getAllChildsTagsFromParent(@Param('parent_id') parent_id: number) {
        const data = await this.tagService.getAllChildsTagsFromParent(parent_id)

        return {
            status: true,
            data
        }
    }

    @ApiOperation({ summary: 'Add tag to user' })
    @ApiBody(AddTagToUserApiBody)
    @Post('add/user')
    async addTagToUser(@UserProperty('uid') uid: string, @Body() dto: AddTagToUserDto) {
        dto.uid = uid
        const data = await this.tagService.addTagToUser(dto)

        return {
            status: true,
            data
        }
    }

}