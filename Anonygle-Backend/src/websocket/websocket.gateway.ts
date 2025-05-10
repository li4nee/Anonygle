import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({cors: {origin: '*'}})
export class WebsocketGateway implements OnModuleInit{

  @WebSocketServer()
  Server: Server
  
  onModuleInit() {
      this.Server.on("connection", (socket) => {
          console.log(socket.id, 'connected');
      })
  }

  @SubscribeMessage('message-event')
  onNewMessageEvent(@MessageBody() body : any)
  {
    this.Server.emit('message-event', body); 
  }

}
