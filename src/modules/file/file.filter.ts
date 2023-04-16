import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';

export const fileFilter = (reg: any) => {
  return (_: any, file: any, cb: any) => {
    if (file.mimetype.match(reg)) {
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  };
};
