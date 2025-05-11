import { OnModuleInit } from '@nestjs/common'
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

const waitingQueue: string[] = []
const pairings: Record<string, string> = {}
@WebSocketGateway({cors: {origin: '*'}})
export class WebsocketGateway implements OnModuleInit,OnGatewayDisconnect{

  @WebSocketServer()
  Server: Server
  
  onModuleInit() {
      this.Server.on("connection", (socket) => {
          console.log(socket.id, 'connected')
      })
  }

  @SubscribeMessage('message')
  onNewMessageEvent(@MessageBody() body :string,@ConnectedSocket()client:Socket)
  {
    const parternerId = pairings[client.id]
    if (parternerId) {
      this.Server.to(parternerId).emit('message', { Message: body})
    }
    else{
      client.emit('error', { message: 'No partner found' })
    }
  }


  @SubscribeMessage('start-match-making')
  onStartMatchMaking(@ConnectedSocket() client: Socket) 
  {
      this.handleMatchMaking(client)
  }


  @SubscribeMessage('next-match-making')
  onNextMatchMaking(@ConnectedSocket() client: Socket)
  {
    this.handleDisconnection(client)
    this.handleMatchMaking(client)
  }


  handleDisconnect(client: Socket) {
    this.handleDisconnection(client)
  }


  private handleMatchMaking(client: Socket) {
    if (pairings[client.id]) {
      client.emit('error', { message: 'You are already in a match' })
      return
    }
    if(waitingQueue.length > 0) {
      const partnerId = waitingQueue.shift()
      if (partnerId) {
        pairings[client.id] = partnerId
        pairings[partnerId] = client.id
        client.emit('match-found', { partnerId })
        this.Server.to(partnerId).emit('match-found', { partnerId: client.id })
      }  
    }
    else{
      waitingQueue.push(client.id)
      client.emit('waiting-for-match')
    }
  }
  
  private handleDisconnection(client: Socket) {
    const partnerId = pairings[client.id]
    if (partnerId) {
      this.Server.to(partnerId).emit('partner_disconnected', { message: 'Your partner has disconnected' })
      delete pairings[partnerId]
      delete pairings[client.id]
    }
    const index = waitingQueue.indexOf(client.id)
    if (index !== -1) {
      waitingQueue.splice(index, 1)
    }
  }

}