import { forwardRef, Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { FileModule } from '../file/file.module';
import { AppModule } from 'src/app.module';
import { IsPetExistConstraint } from 'src/validations/petExists.validation';

@Module({
  imports: [forwardRef(() => AppModule), FileModule],
  controllers: [PetController],
  exports: [PetService],
  providers: [PetService, IsPetExistConstraint],
})
export class PetModule {}
