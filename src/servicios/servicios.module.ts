import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}


