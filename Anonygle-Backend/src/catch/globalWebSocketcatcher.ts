import {
  Catch,
  ArgumentsHost,
  WsExceptionFilter,
  Injectable,
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Logger } from "src/shared/services/logger.service";

@Injectable()
@Catch(WsException)
export class WebSocketExceptionFilter implements WsExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();
    const data = ctx.getData();

    this.logger.webSocketError({
      event: data?.event || "unknown",
      clientId: client?.id || "unknown",
      ip: client?.handshake?.address || "unknown",
      userAgent: client?.handshake?.headers["user-agent"] || "unknown",
      message: exception.message,
      stack: exception.stack,
    });

    client.emit("error", {
      statusCode: 400,
      message: exception.message,
    });
  }
}
