import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CodeService } from './code.service';
import { UpdateSocketCodeDto } from './dto/socket-update-code';

@WebSocketGateway({ cors: true })
export class CodeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly codeService: CodeService) {}

  @SubscribeMessage('joinCodeRoom')
  async handleJoinCodeRoom(
    @MessageBody('shortid') shortId: string,
    @MessageBody('viewPassword') viewPassword: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`codeRoom_${shortId}`);
    try {
      // Find the code by shortId and send it to the client
      const code = await this.codeService.findOne(shortId, { viewPassword });
      client.emit('codeData', code);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('editCode')
  async handleEditCode(
    @MessageBody() updateSocketCodeDto: UpdateSocketCodeDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { shortId, updatePassword, code } = updateSocketCodeDto;
    try {
      // Validate the password and update the code by shortId
      const updatedCode = await this.codeService.update(shortId, {
        updatePassword,
        code,
      });
      // Notify all clients in the room about the updated code
      this.server.to(`codeRoom_${shortId}`).emit('codeUpdated', updatedCode);
    } catch (error) {
      client.emit('error', error.message);
    }
  }
}
