import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class GetLinePostsDto {
    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsNumber()
    offset?: number;

    @IsOptional()
    @IsEnum(['from_users_and_pets', 'tag'])
    order?: 'from_users_and_pets' | 'tag'

    @IsNumber({}, { each: true })
    seenIdPosts: number[]

    current_uid: string
}