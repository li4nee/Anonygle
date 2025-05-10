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
          filename: path.join(logsDir, "info-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "40m",
          maxFiles: "14d",
          level: "info",
        }),

        new winston.transports.DailyRotateFile({
          filename: path.join(logsDir, "error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          level: "error",
          maxSize: "40m",
          maxFiles: "14d",
        }),
      ],
    });

    this.accessLogStream = fs.createWriteStream(
      path.join(logsDir, "access.log"),
      { flags: "a" },
    );
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

    const errorLog = `
    ────────────────────────────────────────────\n
    [ERROR] ${timestamp} \n
    ──────────────────────────────────────────── \n
    Status:-${status}\n
    URL:-${method} ${url}\n
    IP:-${ip}\n
    User-Agent:-${userAgent}\n
    Message:-${message}\n
    \n
    Stack Trace:\n
    ${stack}\n
    \n
    Response:\n
    ${JSON.stringify(errorResponse, null, 2)}
    ────────────────────────────────────────────\n
    `;
    this.winstonLogger.error(errorLog);
    console.error(`[ERROR] ${timestamp} - ${method} ${url} - ${message}`);
  }

  logInfo(message: string): void {
    this.winstonLogger.info({ message, timestamp: new Date().toISOString() });
  }

}
