import * as dotenv from "dotenv";
dotenv.config();

// This file contains the global settings for the application
// It is used to set up the database connection, redis connection, and other global settings

export const globalSettings = {
  WORK_ENVIRONMENT : process.env.WORK_ENVIRONMENT ? "PRODUCTION":"DEVELOPMENT",
  PORT: Number(process.env.PORT) || 4000,
  DB: {
    TYPE: process.env.DB_TYPE || "postgres",
    HOST: process.env.DB_HOST || "localhost",
    PORT: Number(process.env.DB_PORT) || 5432,
    USERNAME: process.env.DB_USERNAME || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "new_password",
    DATABASE: process.env.DB_DATABASE || "selfhosteasy",
  },
  RATE_LIMIT:{
    REQUEST_LIMIT: Number(process.env.REQUEST_LIMIT) || 100,
    TIME_LIMIT: Number(process.env.TIME_LIMIT) || 100,
    BLOCK_DURATION: Number(process.env.BLOCK_DURATION) || 100,
    WHITELIST: process.env.WHITELIST ? process.env.WHITELIST.split(",") : [],
    MAX_RATE_LIMIT_OFFEND: Number(process.env.MAX_RATE_LIMIT_OFFEND) || 5, // if more than offend for 5 times 1 day block
    MAX_RATE_LIMIT_BLOCK_DURATION: Number(process.env.MAX_RATE_LIMIT_BLOCK) || 60 * 60 * 24,
  },
  REDIS: {
    URL: process.env.REDIS_URL || "redis://localhost:6379",
    HOST: process.env.REDIS_HOST || "localhost",
    PORT: Number(process.env.REDIS_PORT) || 6379,
    PASSWORD: process.env.REDIS_PASSWORD || "",
  },

  MAILER: {
    from: process.env.SMTP_EMAIL || "noreply.headspaceout@gmail.com",
    username: process.env.SMTP_EMAIL || "noreply.headspaceout@gmail.com",
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', 
  },
  JWT_SECRET: process.env.JWT_SECRET || "miccheck1212miccheck1212",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "1h",
  APP_URL: process.env.APP_URL || "http://localhost:4000",
};
