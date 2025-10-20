// src/create-users.ts
import * as admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";
import * as path from "path";

const prisma = new PrismaClient();

// Ruta correcta a tu archivo de servicio de Firebase
const serviceAccountPath = path.join(__dirname, "firebase", "capitrack-94c0b-firebase-adminsdk-fbsvc-88c461fcf9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

// Lista de usuarios a crear
const users = [
  {
    nombre: "Axel Hernandez",
    correo: "haxel1201@gmail.com",
    password: "firebase",
    rol_id: 1,
  },
  {
    nombre: "Operador",
    correo: "prueba2@gmail.com",
    password: "123456",
    rol_id: 2,
  },
];

async function createUsers() {
  for (const user of users) {
    try {
      // Crear usuario en Firebase
      const firebaseUser = await admin.auth().createUser({
        email: user.correo,
        password: user.password,
        displayName: user.nombre,
      });
      console.log(`Usuario Firebase creado: ${firebaseUser.uid}`);

      // Crear usuario en la base de datos
      await prisma.usuario.create({
        data: {
          nombre: user.nombre,
          correo: user.correo,
          password: user.password,
          rol_id: user.rol_id,
          estado: true,
          creado_en: new Date(),
          actualizado_en: new Date(),
          // Agrega firebaseUid solo si tu tabla ya tiene esa columna
          // firebaseUid: firebaseUser.uid,
        },
      });

      console.log(`Usuario DB creado: ${user.correo}`);
    } catch (error: any) {
      console.error(`Error creando usuario ${user.correo}:`, error.message);
    }
  }
}

createUsers()
  .then(() => {
    console.log("Proceso terminado.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });



