import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { IUserForToken } from '../types/user';

@Injectable()
export class GetUser implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    try {
      const user = verify(token, process.env.JWT_SECRET);

      req.user = user as IUserForToken;
    } catch (e) {
      console.log(`Срок jwt токена истёк`);
    }

    next();
  }
}
