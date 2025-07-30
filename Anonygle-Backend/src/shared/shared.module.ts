import { Module } from "@nestjs/common";
import { RedisService } from "./services/redis.service";
import { LoginGlobalStore } from "./store/login.store";
import { Logger } from "./services/logger.service";

@Module({
  providers: [Logger, RedisService, LoginGlobalStore],
  exports: [Logger, RedisService, LoginGlobalStore],
})
export class SharedModule {}
