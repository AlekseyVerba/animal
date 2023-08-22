import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

//DECORATORS
import { UserProperty } from 'src/decorators/userProperty.decorator';

//GUARDS
import { AuthGuard } from 'src/guards/auth.guard';

//SERVICES
import { ProfileService } from './profile.service';

//DTO
import { FollowAndUnfollowUserDto } from './dto/followAndUnfollowUser.dto';
import { FollowAndUnfollowPetDto } from './dto/followAndUnfollowPet.dto';
import { GetProfilePetDto } from './dto/getProfilePet.dto';
import { GetProfileUserDto } from './dto/getProfileUser.dto';
import { GetFollowingUsersDto } from './dto/getFollowingUsers.dto';
import { LimitOffsetDto } from './dto/limitOffset.dto';
import { GetProfileFollowersDto } from './dto/getProfileFollowers.dto';

//PIPES
import { ValidationPipe } from 'src/pipes/validation.pipe';

//CONFIGS
import { getProfileFollowersApiBody } from './configs/getProfileFollowers.config';

@ApiTags('Profile')
@UsePipes(new ValidationPipe())
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Follow to user' })
  @Post('user/follow/:user_uid')
  async followToUser(
    @Param() dto: FollowAndUnfollowUserDto,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.current_uid = current_uid;
    await this.profileService.followToProfile({
      current_uid: dto.current_uid,
      profile: dto.user_uid,
      profile_type: 'user',
    });

    return {
      status: true,
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unfollow from user' })
  @Delete('user/unfollow/:user_uid')
  async unfollowFromUser(
    @Param() dto: FollowAndUnfollowUserDto,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.current_uid = current_uid;
    await this.profileService.unfollowFromProfile({
      current_uid: dto.current_uid,
      profile: dto.user_uid,
      profile_type: 'user',
    });

    return {
      status: true,
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Follow to pet' })
  @Post('pet/follow/:pet_id')
  async followToPet(
    @Param() dto: FollowAndUnfollowPetDto,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.current_uid = current_uid;
    await this.profileService.followToProfile({
      current_uid: dto.current_uid,
      profile: dto.pet_id,
      profile_type: 'pet',
    });

    return {
      status: true,
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Unfollow from pet' })
  @Delete('pet/unfollow/:pet_id')
  async unfollowFromPet(
    @Param() dto: FollowAndUnfollowPetDto,
    @UserProperty('uid') current_uid: string,
  ) {
    dto.current_uid = current_uid;
    await this.profileService.unfollowFromProfile({
      current_uid: dto.current_uid,
      profile: dto.pet_id,
      profile_type: 'pet',
    });

    return {
      status: true,
    };
  }

  @ApiOperation({ summary: 'Get profile pet' })
  @Get('pet/:pet_id')
  async getProfilePet(
    @Param() dto: GetProfilePetDto,
    @UserProperty('uid') current_uid: string,
  ) {
    const data = await this.profileService.getProfilePet(
      dto.pet_id,
      current_uid,
    );

    return {
      status: true,
      data,
    };
  }

  @ApiOperation({ summary: 'Get users counts following' })
  @Get('user/:user_uid/counts/following')
  async getUsersCountsFollowing(@Param() { user_uid }: GetProfileUserDto) {
    const data = await this.profileService.getUsersCountsFollowing(user_uid);

    return {
      status: true,
      data,
    };
  }

  @ApiOperation({ summary: 'Get following users in tab users' })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @Get('user/:user_uid/following/users')
  async getFollowingUsers(
    @UserProperty('uid') current_uid: string,
    @Param() dto: GetFollowingUsersDto,
    @Query() dtoQuery: LimitOffsetDto,
  ) {
    dto.uid = current_uid;
    const data = await this.profileService.getFollowingUsers({
      ...dto,
      ...dtoQuery,
    });

    return {
      status: true,
      data,
    };
  }

  @ApiOperation({ summary: 'Get following pets in tab pets' })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @Get('user/:user_uid/following/pets')
  async getFollowingPets(
    @UserProperty('uid') current_uid: string,
    @Param() dto: GetFollowingUsersDto,
    @Query() dtoQuery: LimitOffsetDto,
  ) {
    dto.uid = current_uid;
    const data = await this.profileService.getFollowingPets({
      ...dto,
      ...dtoQuery,
    });

    return {
      status: true,
      data,
    };
  }

  @ApiOperation({ summary: 'Get profile user' })
  @Get('user/:user_uid')
  async getProfileUser(
    @Param() dto: GetProfileUserDto,
    @UserProperty('uid') current_uid: string,
  ) {
    const data = await this.profileService.getProfileUser(
      dto.user_uid,
      current_uid,
    );

    return {
      status: true,
      data,
    };
  }

  @ApiOperation({ summary: 'Получить подписчиков профиля' })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    required: false,
  })
  @ApiBody(getProfileFollowersApiBody)
  @Post('followers')
  async getProfileFollowers(
    @UserProperty('uid') current_uid: string,
    @Body() dto: GetProfileFollowersDto,
    @Query() query: LimitOffsetDto,
  ) {
    dto.uid = current_uid;

    return {
      status: true,
      data: await this.profileService.getProfileFollowers(dto, query),
    };
  }
}
