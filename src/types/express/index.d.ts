import Express from "express"
import { IUserForToken } from "../../user/types"

declare global {
    namespace Express {
        interface Request {
            user?: IUserForToken
        }
    }
}