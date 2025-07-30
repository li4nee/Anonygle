import * as morgan from "morgan";
import * as fs from "fs";
import * as path from "path";
import { Injectable, HttpException } from "@nestjs/common";
import * as winston from "winston";
import "winston-daily-rotate-file";
import { Request } from "express";

@Injectable()
export class Logger {
  private accessLogStream: fs.WriteStream;
  private winstonLogger: winston.Logger;

  constructor() {
    const logsDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.winstonLogger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: path.join(logsDir, "http-info-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "100m",
          maxFiles: "14d",
          level: "info",
          format: winston.format((info) =>
            info.source === "HTTP" ? info : false,
          )(),
        }),

        // HTTP Error
        new winston.transports.DailyRotateFile({
          filename: path.join(logsDir, "http-error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "100m",
          maxFiles: "14d",
          level: "error",
          format: winston.format((info) =>
            info.source === "HTTP" ? info : false,
          )(),
        }),

        // WebSocket Info
        new winston.transports.DailyRotateFile({
          filename: path.join(logsDir, "ws-info-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "100m",
          maxFiles: "14d",
          level: "info",
          format: winston.format((info) =>
            info.source === "WebSocket" ? info : false,
          )(),
        }),

        // WebSocket Error
        new winston.transports.DailyRotateFile({
          filename: path.join(logsDir, "ws-error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "100m",
          maxFiles: "14d",
          level: "error",
          format: winston.format((info) =>
            info.source === "WebSocket" ? info : false,
          )(),
        }),
      ],
    });

    this.accessLogStream = fs.createWriteStream(
      path.join(logsDir, "access.log"),
      { flags: "a" },
    );

    if (process.env.NODE_ENV !== "production") {
      this.winstonLogger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }
  }

  getMiddleware(): ReturnType<typeof morgan> {
    return morgan("combined", { stream: this.accessLogStream });
  }

  logError(exception: HttpException, req: Request): void {
    const errorResponse = exception.getResponse();
    const status = exception.getStatus();
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const message = exception.message || "Unknown error";
    const stack = exception.stack || "No stack trace";

    const log = {
      timestamp,
      source: "HTTP",
      level: "error",
      status,
      method,
      url,
      ip,
      userAgent,
      message,
      stack,
      response: errorResponse,
    };

    this.winstonLogger.error(log);
  }

  logInfo(message: string): void {
    this.winstonLogger.info({
      message,
      timestamp: new Date().toISOString(),
      source: "HTTP",
    });
  }

  webSocketError(context: {
    event: string;
    clientId: string;
    ip: string;
    userAgent?: string;
    message: string;
    stack?: string;
  }): void {
    const timestamp = new Date().toISOString();

    const log = {
      timestamp,
      level: "error",
      source: "WebSocket",
      event: context.event,
      clientId: context.clientId,
      ip: context.ip,
      userAgent: context.userAgent || "Unknown",
      message: context.message,
      stack: context.stack || "No stack trace",
    };
    this.winstonLogger.error(log);
    console.error(
      `[WebSocket ERROR] ${timestamp} - Event: ${context.event} - Client: ${context.clientId} - ${context.message}`,
    );
  }

  webSocketInfo(context: {
    event: string;
    clientId: string;
    ip: string;
    userAgent?: string;
    message: string;
  }): void {
    const log = {
      timestamp: new Date().toISOString(),
      level: "info",
      source: "WebSocket",
      ...context,
    };

    this.winstonLogger.info(log);
    console.log(
      `[WebSocket] ${log.timestamp} - ${context.event} - ${context.message}`,
    );
  }
}
