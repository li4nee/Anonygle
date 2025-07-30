import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, throwError } from "rxjs";
import { catchError, from } from "rxjs";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { RedisClientType } from "redis";
import { Response } from "express";
import { RedisService } from "src/shared/services/redis.service";
import {
  BruteForceLimitOptions,
  RATE_LIMIT_METADATA_KEY,
} from "src/decorator/bruteforce.decorator";
import { TooManyFailedRequestError } from "src/types/error.type";

@Injectable()
export class BruteforceInterceptor implements NestInterceptor {
  private client: RedisClientType;

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {
    this.client = this.redisService.getClient();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const rateLimitOptions: BruteForceLimitOptions = this.reflector.get(
      RATE_LIMIT_METADATA_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) return next.handle();

    const rateLimiter = new RateLimiterRedis({
      storeClient: this.client,
      keyPrefix: "brute_force",
      points: rateLimitOptions.requestLimit,
      duration: rateLimitOptions.timeLimit,
      blockDuration: rateLimitOptions.blockDuration,
    });

    const key =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    return await this.applyRateLimit(
      next,
      res,
      rateLimiter,
      key,
      rateLimitOptions,
    );
  }

  private setHeaders(
    res: any,
    requestLimit: number,
    remaining: number,
    resetTime: number,
  ) {
    res.setHeader("X-RateLimit-Limit", requestLimit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader(
      "X-RateLimit-Reset",
      Math.floor((Date.now() + resetTime) / 1000),
    );
  }

  private setBlockedHeaders(
    res: any,
    retryAfter: number,
    requestLimit: number,
    resetTime: number,
  ) {
    res.setHeader("Retry-After", retryAfter);
    this.setHeaders(res, requestLimit, 0, resetTime);
  }

  private async applyRateLimit(
    next: CallHandler,
    res: any,
    rateLimiter: RateLimiterRedis,
    key: string,
    options: BruteForceLimitOptions,
  ): Promise<Observable<any>> {
    try {
      const rateLimitRes = await rateLimiter.consume(key);
      this.setHeaders(
        res,
        options.requestLimit,
        rateLimitRes.remainingPoints,
        rateLimitRes.msBeforeNext,
      );
      return next.handle();
    } catch (err: any) {
      if (err instanceof RateLimiterRes) {
        const retryAfter = Math.ceil(err.msBeforeNext / 1000);
        this.setBlockedHeaders(
          res,
          retryAfter,
          options.requestLimit,
          err.msBeforeNext,
        );
        throw new TooManyFailedRequestError(
          `Too many failed attempts. Try again in ${retryAfter} seconds.`,
        );
      }
      throw err;
    }
  }
}
