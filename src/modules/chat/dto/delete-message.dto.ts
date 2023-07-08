import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsEmpty, IsOptional } from "class-validator"
import { IsMessagerExist } from "src/validations/messageExists.validation"

export class DeleteMessageDTO {
    @ApiProperty({
        name: 'id',
        type: Number,
        description: 'id сообщения',
        required: true
    })
    @IsMessagerExist()
    id: number

    @ApiProperty({
        name: 'partner',
        type: Boolean,
        description: 'Удалить у партнёра',
        required: true
    })
    @IsBoolean()
    @IsOptional()
    partner: boolean

    @IsEmpty()
    uid: string
}