import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CustomError } from "src/types/error.type";
import { Logger } from "src/shared/services/logger.service";
import { ValidationError } from "yup";

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = this.findErrorCode(exception);
    this.logger.logError(exception, request);
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }

  private findErrorCode(exception: unknown): number {
    if (exception instanceof CustomError) {
      return exception.statusCode;
    } else if (exception instanceof ValidationError) {
      return 400;
    } else if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return 500;
  }
}
