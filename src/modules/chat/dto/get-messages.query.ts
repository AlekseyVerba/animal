import { IsNumber, IsOptional } from "class-validator";

export class GetMessagesQuery {
    @IsOptional()
    @IsNumber()
    limit?: number;
  
    @IsOptional()
    @IsNumber()
    offset?: number;
  }