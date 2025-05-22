import { OnModuleInit } from '@nestjs/common'
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { v4 as UUID } from 'uuid'
const waitingQueue: string[] = []
const rooms = new Map<string, string[]>()
const clientToRoom = new Map<string, string>()
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
    let roomId = clientToRoom.get(client.id)
    let roomMembers = roomId ? rooms.get(roomId) : undefined
    if (!roomMembers || roomMembers?.length==0) {
      client.emit('error', { message: 'You are not in a room' })
      return
    }
    let otherMembers = roomMembers?.filter((member) => member !== client.id)
    if (otherMembers?.length === 0) {
      client.emit('error', { message: 'No other members in the room' })
      return
    }
    let otherMemberId = otherMembers?otherMembers[0]:null;
    otherMemberId ? this.Server.to(otherMemberId).emit('new-message', { message: body }):null
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


  @SubscribeMessage('cancel-match-making')
  onCancelMatchMaking(@ConnectedSocket() client: Socket) {
    const index = waitingQueue.indexOf(client.id)
    if(clientToRoom.get(client.id))
    {
      return client.emit("error",{message:"You are already in a room"})
    }
    if (index !== -1) {
      waitingQueue.splice(index, 1)
      client.emit('match-making-cancelled', { message: 'Matchmaking cancelled' })
    }
  }

  @SubscribeMessage('offer-connection')
  handleOffer(@ConnectedSocket() client: Socket, @MessageBody() data: { offer: RTCSessionDescriptionInit }) {
    const partnerId = this.checkForRoomAndReturnPartnerId(client)
    if (partnerId) {
      this.Server.to(partnerId).emit('incomming-offer-connection', { offer: data.offer })
    }
    else
    {
      client.emit("error",{message:"Not joined in any room"})
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() data: { answer: RTCSessionDescriptionInit }) {
    const partnerId = this.checkForRoomAndReturnPartnerId(client)
    if (partnerId) {
      this.Server.to(partnerId).emit('answer-reply', { answer: data.answer })
    }
    else
    {
      client.emit("error",{message:"Not joined in any room"})
    }
  }


  private checkForRoomAndReturnPartnerId(client: Socket):string | undefined {
    const roomId = clientToRoom.get(client.id)
    if (!roomId) 
      return
    return rooms.get(roomId)?.find(id => id !== client.id)
  }


  private handleMatchMaking(client: Socket) {
    let roomId = clientToRoom.get(client.id)
    if (roomId) {
      client.emit('error', { message: 'You are already in a room' })
      return 
    }
    if(waitingQueue.length > 0) {
      const partnerId = waitingQueue.shift()
      if (partnerId) {
        const roomId = UUID()
        rooms.set(roomId,[client.id, partnerId])
        clientToRoom.set(client.id, roomId)
        clientToRoom.set(partnerId, roomId)
        const partnerSocket = this.Server.sockets.sockets.get(partnerId)
        if (partnerSocket) {
          client.join(roomId)
          partnerSocket.join(roomId)
          client.emit('match-found', { roomId})
          // partnerSocket.emit('match-found-client', { roomId })
        }
        this.updateOnlineUsers()
      }  
    }
    else{
      waitingQueue.push(client.id)
      client.emit('waiting-for-match')
      this.updateOnlineUsers()
    }
  }
  
  private handleDisconnection(client: Socket) {
    let roomId = clientToRoom.get(client.id)
    if (roomId) {
      client.leave(roomId)
      clientToRoom.delete(client.id)
      let roomMembers = rooms.get(roomId)
      const partnerId = roomMembers?.find((member) => member !== client.id)
      if (partnerId) {
        clientToRoom.delete(partnerId)
        let partnerSocket = this.Server.sockets.sockets.get(partnerId)
        if(partnerSocket)
        { 
          partnerSocket.leave(roomId)
          partnerSocket.emit('partner-disconnected', { message: 'Your partner has disconnected' })
        }
      }
    }
    this.cleanUpAfterDisconnection(client,roomId )
    this.updateOnlineUsers()
    
  }

  private cleanUpAfterDisconnection(client: Socket,roomId:string | undefined) {
    if (roomId) {
      rooms.delete(roomId)
    }
    const index = waitingQueue.indexOf(client.id)
    if (index !== -1) {
      waitingQueue.splice(index, 1)
    }
  }

  private updateOnlineUsers() {
    this.Server.emit('online-users', this.Server.engine.clientsCount)
  }

}