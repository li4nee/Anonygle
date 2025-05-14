import { OnModuleInit } from '@nestjs/common'
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { v4 as UUID } from 'uuid'
const waitingQueue: string[] = []
const pairings: Record<string, string> = {}
const rooms : Record<string, string[]> = {}
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
    console.log('New message from client:', body)
    let roomId = Object.keys(rooms).find((room) => rooms[room].includes(client.id))
    if (!roomId) {
      client.emit('error', { message: 'You are not in a room' })
      return
    }
    const roomMembers = rooms[roomId]
    const otherMembers = roomMembers.filter((member) => member !== client.id)
    if (otherMembers.length === 0) {
      client.emit('error', { message: 'No other members in the room' })
      return
    }
    const otherMemberId = otherMembers[0]
    this.Server.to(otherMemberId).emit('new-message', { message: body })
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

  @SubscribeMessage('disconnect-match-making')
  onDisconnect(@ConnectedSocket() client: Socket) {
    this.handleDisconnection(client)
  }


  handleDisconnect(client: Socket) {
    this.handleDisconnection(client)
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    // if (!rooms[roomId]) {
    //   client.emit('error', { message: 'Room not found' })
    //   return 
    // }
    // if (rooms[roomId].includes(client.id)) {
    //   client.emit('error', { message: 'You are already in this room' })
    //   return
    // }
    // if (rooms[roomId].length >= 2) {
    //   client.emit('error', { message: 'Room is full' })
    //   return
    // }
    rooms[roomId].push(client.id)
    client.join(roomId)
  }

  @SubscribeMessage('cancel-match-making')
  onCancelMatchMaking(@ConnectedSocket() client: Socket) {
    console.log('Cancelling matchmaking for client:', client.id)
    const index = waitingQueue.indexOf(client.id)
    if (pairings[client.id]) {
      client.emit('error', { message: 'You are already in a match' })
      return
    }
    if (index !== -1) {
      waitingQueue.splice(index, 1)
      client.emit('match-making-cancelled', { message: 'Matchmaking cancelled' })
    }
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
        const roomId = UUID()
        rooms[roomId] = [client.id, partnerId]
        client.emit('match-found', { roomId})
        this.Server.to(partnerId).emit('match-found', { roomId })
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
      this.Server.to(partnerId).emit('partner-disconnected', { message: 'Your partner has disconnected' })
      delete pairings[partnerId]
      delete pairings[client.id]
    }
    this.cleanUpAfterDisconnection(client)
    client.disconnect()
  }

  private cleanUpAfterDisconnection(client: Socket) {
    const roomId = Object.keys(rooms).find((room) => rooms[room].includes(client.id))
    if (roomId) {
      delete rooms[roomId]
    }
    const index = waitingQueue.indexOf(client.id)
    if (index !== -1) {
      waitingQueue.splice(index, 1)
    }
  }

}