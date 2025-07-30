import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { RedisService } from "src/shared/services/redis.service";
import { globalSettings } from "src/config/settings.config";

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private rateLimiter: RateLimiterRedis;

  constructor(private readonly redisService: RedisService) {
    const client = this.redisService.getClient();

    this.rateLimiter = new RateLimiterRedis({
      storeClient: client,
      keyPrefix: "rate_limit_global",
      points: globalSettings.RATE_LIMIT.REQUEST_LIMIT, // Number of requests
      duration: globalSettings.RATE_LIMIT.TIME_LIMIT, // Per Time unit
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
      // If the user has exceeded the rate limit, we will block them for a certain amount of time
      // The block duration will increase based on the number of times the user has exceeded the rate limit
      // If the user has exceeded the rate limit more than 5 times, we will block them for 1 day
      // const retryCount = rateLimiterRes.consumedPoints - globalSettings.RATE_LIMIT.REQUEST_LIMIT;
      // if (retryCount >= globalSettings.RATE_LIMIT.MAX_RATE_LIMIT_OFFEND)
      //     blockDuration = globalSettings.RATE_LIMIT.MAX_RATE_LIMIT_BLOCK_DURATION;
      // else if (retryCount >= 5)
      //     blockDuration *= 10;
      // else if (retryCount >= 3)
      //     blockDuration *= 5;
      // else if (retryCount >= 2)
      //     blockDuration *= 2;

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
