import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App;

  constructor() {
    // 👇 Si ya hay una app inicializada, solo la reutilizamos
    if (admin.apps.length) {
      this.logger.log('Reutilizando instancia existente de Firebase Admin');
      this.app = admin.app();
      return;
    }

    // 👇 Primera vez: leemos el json y creamos la app
    this.logger.log('Inicializando Firebase Admin con firebase-admin.json');

    const filePath = path.join(
      process.cwd(),
      'src',
      'firebase',
      'firebase-admin.json',
    );

    const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    this.app = admin.initializeApp({
      credential: admin.credential.cert(
        serviceAccount as admin.ServiceAccount,
      ),
    });
  }

  getAuth() {
    return this.app.auth();
  }

  async verifyIdToken(token: string) {
    return this.app.auth().verifyIdToken(token);
  }
}
