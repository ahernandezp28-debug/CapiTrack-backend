import { Module } from '@nestjs/common';
import { GeocercasService } from './geocercas.service';
import { GeocercasController } from './geocercas.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [GeocercasController],
  providers: [GeocercasService, PrismaService],
})
export class GeocercasModule {}

