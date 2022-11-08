import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { IUserForToken } from "../types/user"

export const UserProperty = createParamDecorator(
    (property: keyof IUserForToken, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const returnData = request.user[property] ? request.user[property] : undefined
        return returnData
    }
)