import { Module } from '@nestjs/common';
import { ServicioService } from './servicios.service';
import { ServicioController } from './servicios.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [ServicioController],
  providers: [ServicioService],
})
export class ServiciosModule {}


