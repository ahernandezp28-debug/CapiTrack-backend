import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [ProveedoresController],
  providers: [ProveedoresService, PrismaService],
  exports: [ProveedoresService],
})
export class ProveedoresModule {}
