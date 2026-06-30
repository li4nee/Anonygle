import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppData } from "./config/db.config";
import { SharedModule } from "./shared/shared.module";
import { RateLimitMiddleware } from "./middleware/ratelimit.middleware";
import { WebsocketGateway } from "./websocket/websocket.gateway";
import { SessionDetails } from "./entity/sessionDetails.entity";
import { ChatPairing } from "./entity/chatParings.entity";
import { ModerationReport } from "./entity/report.entity";
import { AdminCredential } from "./entity/adminCredential.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot(AppData),
    TypeOrmModule.forFeature([SessionDetails, ChatPairing, ModerationReport, AdminCredential]),
    SharedModule,
  ],
  providers: [AppService, WebsocketGateway],
  exports: [SharedModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes("/");
  }
}
