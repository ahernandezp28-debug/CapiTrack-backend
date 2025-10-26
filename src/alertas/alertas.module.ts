import { Module } from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [FirebaseModule, NotificationsModule],
  providers: [AlertasService, PrismaService],
  controllers: [AlertasController],
})
export class AlertasModule {}
