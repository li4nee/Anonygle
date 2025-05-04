import * as jwt from "jsonwebtoken";
import { createClient, RedisClientType } from "redis";
import { globalSettings } from "src/config/settings.config";
import { PermissionNotGranted } from "src/types/error.type";
import { Logger } from "src/shared/services/logger.service";
import { RedisService } from "src/shared/services/redis.service";
import { Injectable } from "@nestjs/common";
import { SessionToken } from "src/types/base.type";

/**
 * LoginGlobalStore is a singleton class that manages the login session tokens for users.
 */
@Injectable()
export class LoginGlobalStore {
  
  login_hash = "login_store"
  private secret: string =globalSettings.JWT_SECRET || "miccheck1212miccheck1212"
  private client : RedisClientType
  constructor(private readonly redisService: RedisService) {
  }

  onModuleInit() {
    this.client = this.redisService.getClient();
  }

  private validateToken = (token: string): SessionToken | undefined => {
    try {
      
      return jwt.verify(token, this.secret) as SessionToken;
    } catch(err) {
      return undefined;
    }
  };
  
  private setToken = async (hash: string, sessionId: string, token: string, expiry?: number) => {
    const key = `${hash}:${sessionId}`;
    await this.client.sAdd(key, token);
    if (expiry) 
      await this.client.expire(key, expiry);
  };
  
  private getToken = async (hash: string, sessionId: string) => {
    const key = `${hash}:${sessionId}`;
    const exists = await this.client.exists(key);
    if (!exists) 
      return { found: false, tokens: [] };
    const tokens = await this.client.sMembers(key); // sab token dincha esle
    return { found: true, tokens };
  };
  
  private removeToken = async (hash: string, sessionId: string, token: string) => {
    const key = `${hash}:${sessionId}`;
    const removed = await this.client.sRem(key, token);
    const remaining = await this.client.sCard(key);  // Kati ota remaining tokens cha tesko count dincha esle
    if (remaining === 0) 
      await this.client.del(key);
    return removed === 1;
  };
  

  removeSessionToken = async (sessionId: string, token: string) => {
    return await this.removeToken(this.login_hash, sessionId, token);
  };

  verifySessionToken = async (token: string) => {
    if (!token) throw new PermissionNotGranted("SessionToken not found");
    let verify = this.validateToken(token);
    if (!verify) return undefined;
    let { found, tokens } = await this.getToken(
      this.login_hash,
      verify.sessionId,
    );
    if (!found || tokens.indexOf(token) <= -1)
      throw new PermissionNotGranted("Session expired");
    return verify;
  };

  setSessionToken = async (token: string, sessionId: string) => {
    await this.setToken(this.login_hash, sessionId, token,60*60);
  };

}

