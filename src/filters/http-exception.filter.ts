import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log(exception)
    const status = exception.getStatus();
    const responseException = exception.getResponse()

    const data = typeof responseException === 'object' ? {status: false, ...responseException} : 
        {status: false, message: responseException}

    response
      .status(status)
      .json(data);
  }
}