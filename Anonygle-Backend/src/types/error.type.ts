import { HttpException } from "@nestjs/common";

export class CustomError extends HttpException {
  statusCode: number;
  message: string;
  constructor(statusCode: number, message: string) {
    super(message, statusCode);
    this.statusCode = statusCode;
    this.message = message;
    this.name = this.constructor.name;
  }
}
export class TestError extends CustomError {
  constructor(message: string = "Test error") {
    super(500, message);
    this.message = message;
    this.name = "TestError";
  }
}
export class PermissionNotGranted extends CustomError {
  constructor(message: string = "Permission not granted") {
    super(403, message);
    this.message = message;
    this.name = "PermissionNotGranted";
  }
}

export class InvalidInputError extends CustomError {
  constructor(message: string = "Permission not granted") {
    super(400, message);
    this.message = message;
    this.name = "InvalidInput";
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = "Rate limit exceeded") {
    super(429, message);
    this.message = message;
    this.name = "RateLimitError";
  }
}

export class MailSendError extends CustomError{
  constructor(message: string = "Error Sending Mail") {
    super(500, message);
    this.message = message;
    this.name = "MailSendError";
  }
}

export class TooManyFailedRequestError extends CustomError {
  constructor(message: string = "Too many failed requests") {
    super(429, message);
    this.message = message;
    this.name = "TooManyFailedRequests";
  }
}
