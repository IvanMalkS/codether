import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CodeService } from './code.service';
import { FindCodeDto } from './dto/find-code.dto';
import { UpdateSocketCodeDto } from './dto/socket-update-code';

@WebSocketGateway({ cors: true })
export class CodeGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly codeService: CodeService) {}

  @SubscribeMessage('joinCodeRoom')
  async handleJoinCodeRoom(
    @MessageBody('codeId') codeId: number,
    @MessageBody('viewPassword') viewPassword: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`codeRoom_${codeId}`);
    try {
      // Find the code and send it to the client
      const code = await this.codeService.findOne(codeId, {
        viewPassword,
      } as FindCodeDto);
      client.emit('codeData', code);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('editCode')
  async handleEditCode(
    @MessageBody() UpdateSocketCodeDto: UpdateSocketCodeDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { id, updatePassword, code } = UpdateSocketCodeDto;
    try {
      // Validate the password and update the code
      const updatedCode = await this.codeService.update(id, {
        updatePassword,
        code,
      });
      // Notify all clients in the room about the updated code
      this.server.to(`codeRoom_${id}`).emit('codeUpdated', updatedCode);
    } catch (error) {
      client.emit('error', error.message);
    }
  }
}
