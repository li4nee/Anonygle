import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
import { globalSettings } from "src/config/settings.config";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor() {
    console.log("redis")
    this.client = createClient({ url: globalSettings.REDIS.URL });

    this.client.on("error", (e) => {
      console.error("Redis connection error:", e);
      throw new Error("Redis connection error");
    });
  }

  async onModuleInit() {
    await this.client.connect();
    console.log("Redis connected");
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log("Redis disconnected");
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
