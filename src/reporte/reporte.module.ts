import { Module } from '@nestjs/common';
import { ReportesService } from './reporte.service';
import { ReportesController } from './reporte.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
