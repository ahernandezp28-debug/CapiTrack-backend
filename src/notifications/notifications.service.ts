import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  emitirNuevaAlerta(alerta: any) {
    this.gateway.notificarNuevaAlerta(alerta);
  }
}

