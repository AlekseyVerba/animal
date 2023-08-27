import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_POOL } from 'src/constants/database.constants';
import { Pool } from 'pg';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello 123';
  }
}
