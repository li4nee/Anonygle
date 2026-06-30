import { Injectable, NestMiddleware, OnModuleInit } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { RedisService } from "src/shared/services/redis.service";
import { globalSettings } from "src/config/settings.config";

@Injectable()
export class RateLimitMiddleware implements NestMiddleware, OnModuleInit {
  private rateLimiter: RateLimiterRedis;

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redisService.getClient(),
      keyPrefix: "rate_limit_global",
      points: globalSettings.RATE_LIMIT.REQUEST_LIMIT,
      duration: globalSettings.RATE_LIMIT.TIME_LIMIT,
      execEvenly: false,
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip as string;
    const whitelist = globalSettings.RATE_LIMIT.WHITELIST;

    if (whitelist.some((w) => ip.startsWith(w))) {
      return next();
    }

    try {
      await this.rateLimiter.consume(ip);
      return next();
    } catch (rateLimiterRes) {
      let blockDuration = globalSettings.RATE_LIMIT.BLOCK_DURATION;
      // Block the user for the specified duration
      await this.rateLimiter.block(ip, blockDuration);
      return res.status(429).json({
        message: "Too many requests.",
        retryAfter: blockDuration,
        captcha: true,
      });
    }
  }
}
