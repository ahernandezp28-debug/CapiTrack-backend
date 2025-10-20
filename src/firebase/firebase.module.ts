// src/firebase/firebase.module.ts
import { Module } from '@nestjs/common';
import { FirebaseSyncService } from '../auth/firebase-sync.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // <- importamos PrismaModule
  providers: [FirebaseAdminService, FirebaseSyncService],
  exports: [FirebaseSyncService, FirebaseAdminService],
})
export class FirebaseModule {}
