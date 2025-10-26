import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as admin from 'firebase-admin';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws/notifications',
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.query.token as string;

    if (!token) {
      console.error('❌ Conexión rechazada: token no enviado');
      socket.disconnect();
      return;
    }

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      socket.data.user = decoded;
      console.log('✅ WebSocket conectado:', decoded.email);
    } catch (error: any) {
      console.error('❌ Token inválido:', error.message);
      socket.disconnect();
    }
  }

  // ✅ Método para tocar a TODOS los clientes
  notificarNuevaAlerta(alerta: any) {
    this.server.emit('alerta_creada', alerta);
  }

  // ✅ Ejemplo para validar recepción desde un cliente (opcional)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log('Ping recibido', data);
    client.emit('pong', { mensaje: 'Pong desde el servidor' });
  }
}
