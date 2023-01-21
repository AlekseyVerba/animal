import { forwardRef, Module } from "@nestjs/common";
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { AppModule } from "src/app.module";

@Module({
    imports: [
        forwardRef(() => AppModule),
    ],
    controllers: [
        ProfileController
    ],
    providers: [
        ProfileService
    ],
    exports: [
        ProfileService
    ]
})
export class ProfileModule {}