import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppData } from "./config/db.config";
import { SharedModule } from "./shared/shared.module";
import { RateLimitMiddleware } from "./middleware/ratelimit.middleware";
import { RepoModule } from "./repo/repo.module";
import { WebsocketGateway } from './websocket/websocket.gateway';

@Module({
  imports: [
    // Yo chai database ko configuration
    TypeOrmModule.forRoot(AppData),
    // Yo chai database ko table haru ko configuration
    TypeOrmModule.forFeature([]),
    RepoModule,
    SharedModule
  ],
  providers: [AppService,WebsocketGateway,],
  exports: [SharedModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware)
    .forRoutes("/")
  }
}
