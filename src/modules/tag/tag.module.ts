import { forwardRef, Module } from "@nestjs/common";
import { TagService } from './tag.service';
import { TagController } from './tag.controller'
import { AppModule } from "src/app.module";
import { TagExistsConstraint } from 'src/validations/tagExists.validation';

@Module({
    imports: [
        forwardRef(() => AppModule)
    ],
    controllers: [TagController],
    providers: [TagService, TagExistsConstraint],
    exports: [TagService]
})
export class TagModule {}