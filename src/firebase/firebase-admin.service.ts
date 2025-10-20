import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  public adminApp: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      // Ruta base depende de si estás en src (desarrollo) o dist (producción)
      const basePath = process.env.NODE_ENV === 'production' ? 'dist' : 'src';
      
      // Cambia el nombre de tu key aquí si es necesario
      const keyFileName = 'capitrack-94c0b-firebase-adminsdk-fbsvc-88c461fcf9.json';
      const keyPath = join(process.cwd(), basePath, 'firebase', keyFileName);

      if (!existsSync(keyPath)) {
        throw new Error(`❌ Firebase key file not found at: ${keyPath}`);
      }

      this.adminApp = admin.initializeApp({
        credential: admin.credential.cert(keyPath),
      });

      console.log('✅ Firebase Admin inicializado correctamente');
    } else {
      this.adminApp = admin.app();
    }
  }

  getAuth() {
    return this.adminApp.auth();
  }
}
