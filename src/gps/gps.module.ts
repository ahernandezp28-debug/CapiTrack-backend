import { Module } from '@nestjs/common';
import { GpsService } from './gps.service';
import { GpsController } from './gps.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [GpsController],
  providers: [GpsService, PrismaService],
})
export class GpsModule {}
