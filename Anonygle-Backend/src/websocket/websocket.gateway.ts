import { OnModuleInit } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { RedisClientType } from "redis";
import { Server, Socket } from "socket.io";
import { Logger } from "src/shared/services/logger.service";
import { RedisService } from "src/shared/services/redis.service";
import { v4 as UUID } from "uuid";
@WebSocketGateway({ cors: { origin: "*" }, transports: ["websocket"] })
export class WebsocketGateway implements OnModuleInit, OnGatewayDisconnect {
  private redisClient: RedisClientType;
  private waitingQueueKey = "waitingQueue";
  private roomsKey = "rooms";
  private clientToRoomKey = "clientToRoom";
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {}

  @WebSocketServer()
  Server: Server;

  onModuleInit() {
    this.redisClient = this.redisService.getClient();

    this.Server.on("connection", (socket) => {
      this.logEvents("connection", socket, "Client connected", false);
      console.log(socket.id, "connected");
    });
  }

  @SubscribeMessage("message")
  async onNewMessageEvent(
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = await this.redisClient.hGet(this.clientToRoomKey, client.id);
    if (!roomId) {
      this.logEvents("message", client, "You are not in a room", true);
      return client.emit("error", { message: "You are not in a room" });
    }

    const roomData = await this.redisClient.hGet(this.roomsKey, roomId);
    const roomMembers = roomData ? JSON.parse(roomData) : [];
    const otherMemberId = roomMembers.find((id) => id !== client.id);
    if (!otherMemberId) {
      this.logEvents("message", client, "No other members in the room", true);
      return client.emit("error", { message: "No other members in the room" });
    }

    return this.logEvents(
      "message",
      client,
      `Message sent to ${otherMemberId}`,
      false,
    );
  }

  @SubscribeMessage("start-match-making")
  async onStartMatchMaking(@ConnectedSocket() client: Socket) {
    await this.handleMatchMaking(client);
  }

  @SubscribeMessage("next-match-making")
  async onNextMatchMaking(@ConnectedSocket() client: Socket) {
    await this.handleDisconnection(client);
    await this.handleMatchMaking(client);
  }

  @SubscribeMessage("disconnect-match-making")
  async onDisconnect(@ConnectedSocket() client: Socket) {
    await this.handleDisconnection(client);
  }

  async handleDisconnect(client: Socket) {
    await this.handleDisconnection(client);
  }

  @SubscribeMessage("cancel-match-making")
  async onCancelMatchMaking(@ConnectedSocket() client: Socket) {
    const isInRoom = await this.redisClient.hGet(
      this.clientToRoomKey,
      client.id,
    );
    if (isInRoom) {
      this.logEvents(
        "cancel-match-making",
        client,
        "You are already in a room",
        true,
      );
      return client.emit("error", { message: "You are already in a room" });
    }

    await this.redisClient.lRem(this.waitingQueueKey, 0, client.id);
    client.emit("match-making-cancelled", { message: "Matchmaking cancelled" });
    this.logEvents(
      "cancel-match-making",
      client,
      "Matchmaking cancelled",
      false,
    );
  }

  @SubscribeMessage("offer-connection")
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { offer: RTCSessionDescriptionInit },
  ) {
    const partnerId = await this.checkForRoomAndReturnPartnerId(client);
    if (partnerId) {
      this.Server.to(partnerId).emit("incomming-offer-connection", {
        offer: data.offer,
      });
    } else {
      this.logEvents(
        "offer-connection",
        client,
        "Not joined in any room",
        true,
      );
      return client.emit("error", { message: "Not joined in any room" });
    }
  }

  @SubscribeMessage("answer")
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { answer: RTCSessionDescriptionInit },
  ) {
    const partnerId = await this.checkForRoomAndReturnPartnerId(client);
    if (partnerId) {
      this.logEvents(
        "answer",
        client,
        `Answer created for ${partnerId}`,
        false,
      );
      this.Server.to(partnerId).emit("answer-reply", { answer: data.answer });
    } else {
      this.logEvents("answer", client, "Not joined in any room", true);
      return client.emit("error", { message: "Not joined in any room" });
    }
  }

  @SubscribeMessage("ice-candidate")
  async handleIceCandidate(client: Socket, candidate: RTCIceCandidateInit) {
    const partnerId = await this.checkForRoomAndReturnPartnerId(client);
    if (partnerId) {
      this.Server.to(partnerId).emit("ice-candidate", candidate);
    }
  }

  @SubscribeMessage("peer:nego:needed")
  async handlePeerNegoNeeded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { offer: RTCSessionDescriptionInit },
  ) {
    const partnerId = await this.checkForRoomAndReturnPartnerId(client);
    if (partnerId) {
      this.Server.to(partnerId).emit("peer:nego:needed", { offer: data.offer });
    }
  }

  @SubscribeMessage("peer:nego:final")
  async handlePeerNegoFinal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { answer: RTCSessionDescriptionInit },
  ) {
    const partnerId = await this.checkForRoomAndReturnPartnerId(client);
    if (partnerId) {
      this.Server.to(partnerId).emit("peer:nego:final", {
        answer: data.answer,
      });
    }
  }

  private async checkForRoomAndReturnPartnerId(
    client: Socket,
  ): Promise<string | undefined> {
    const roomId = await this.redisClient.hGet(this.clientToRoomKey, client.id);
    if (!roomId) return;
    const roomData = await this.redisClient.hGet(this.roomsKey, roomId);
    const members = roomData ? JSON.parse(roomData) : [];
    return members.find((id) => id !== client.id);
  }

  private async handleMatchMaking(client: Socket) {
    const existingRoomId = await this.redisClient.hGet(
      this.clientToRoomKey,
      client.id,
    );
    if (existingRoomId) {
      return client.emit("error", { message: "You are already in a room" });
    }

    const partnerId = await this.redisClient.lPop(this.waitingQueueKey);
    if (partnerId) {
      const newRoomId = UUID();
      const members = [client.id, partnerId];

      await this.redisClient.hSet(
        this.roomsKey,
        newRoomId,
        JSON.stringify(members),
      );
      await this.redisClient.hSet(this.clientToRoomKey, client.id, newRoomId);
      await this.redisClient.hSet(this.clientToRoomKey, partnerId, newRoomId);

      const partnerSocket = this.Server.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        client.join(newRoomId);
        partnerSocket.join(newRoomId);
        client.emit("match-found", { roomId: newRoomId });
      }
    } else {
      await this.redisClient.rPush(this.waitingQueueKey, client.id);
      client.emit("waiting-for-match");
    }

    this.updateOnlineUsers();
  }

  private async handleDisconnection(client: Socket) {
    const roomId = await this.redisClient.hGet(this.clientToRoomKey, client.id);
    if (roomId) {
      client.leave(roomId);
      await this.redisClient.hDel(this.clientToRoomKey, client.id);

      const roomData = await this.redisClient.hGet(this.roomsKey, roomId);
      const members = roomData ? JSON.parse(roomData) : [];
      const partnerId = members.find((id) => id !== client.id);

      if (partnerId) {
        await this.redisClient.hDel(this.clientToRoomKey, partnerId);
        const partnerSocket = this.Server.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.leave(roomId);
          partnerSocket.emit("partner-disconnected", {
            message: "Your partner has disconnected",
          });
        }
      }

      await this.redisClient.hDel(this.roomsKey, roomId);
    }

    await this.redisClient.lRem(this.waitingQueueKey, 0, client.id); // remove all the occurance of client.id in list
    this.updateOnlineUsers();
  }

  private updateOnlineUsers() {
    this.Server.emit("online-users", this.Server.engine.clientsCount);
  }

  private logEvents(
    event: string,
    client: Socket,
    message: string,
    error = true,
  ) {
    if (error)
      this.logger.webSocketError({
        event,
        clientId: client.id,
        ip: client.handshake.address,
        userAgent: client.handshake.headers["user-agent"],
        message,
      });
    else
      this.logger.webSocketInfo({
        event,
        clientId: client.id,
        ip: client.handshake.address,
        userAgent: client.handshake.headers["user-agent"],
        message,
      });
  }
}
