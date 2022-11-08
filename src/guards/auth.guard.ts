import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Observable } from "rxjs";
import { Request } from "express"

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: Request = context.switchToHttp().getRequest()

        if (req.user) return true
        return false

    }
    
}