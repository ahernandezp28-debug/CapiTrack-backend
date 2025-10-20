 CapiTrack Backend

**CapiTrack** es un sistema de gestión y monitoreo de flota operativa para la empresa **Constructora Capital S.A.**  
Permite controlar maquinaria y camiones en tiempo real, registrar combustible, servicios, reportes de trabajo y analizar información desde dashboards con Power BI.

Este repositorio contiene la **API Backend**, desarrollada con **NestJS**, **Prisma ORM**, **PostgreSQL** y **Firebase Authentication**.

---

##  Tecnologías Principales

| Componente | Descripción |
|-------------|-------------|
| **NestJS** | Framework de backend modular basado en TypeScript. |
| **Prisma ORM** | ORM moderno para manejar la base de datos PostgreSQL. |
| **PostgreSQL** | Base de datos relacional principal del sistema. |
| **Firebase** | Se usa para autenticación segura mediante tokens JWT. |
| **Power BI (externo)** | Visualización y análisis de datos generados por el sistema. |

---

## 🏗️ Arquitectura General

CapiTrack Backend
├── src/
│ ├── auth/ # Autenticación con Firebase y control de roles
│ ├── usuarios/ # Módulo de usuarios (admin, operador, encargado)
│ ├── unidades/ # Gestión de unidades (vehículos, maquinaria)
│ ├── proveedores/ # Registro de proveedores externos
│ ├── combustible/ # Control de consumo y registro de combustible
│ ├── firebase/ # Inicialización del SDK de Firebase Admin
│ ├── prisma/ # Conexión a base de datos
│ └── main.ts # Punto de entrada principal
│
├── prisma/
│ ├── schema.prisma # Definición de modelos y relaciones
│ └── migrations/ # Historial de migraciones de base de datos
│
└── .env # Variables de entorno (no se sube al repo)

yaml
Copiar código

---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/axelhernandezgt/capitrack-backend.git
cd capitrack-backend
2️⃣ Instalar dependencias
bash
Copiar código
npm install
3️⃣ Configurar variables de entorno
Crea un archivo .env en la raíz con el siguiente formato:

env
Copiar código
# PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/capitrack_db?schema=public"

# Firebase
FIREBASE_PROJECT_ID=capitrack-94c0b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@capitrack-94c0b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----\n"


4️⃣ Ejecutar migraciones
bash
Copiar código
npx prisma migrate dev
5️⃣ Iniciar el servidor
bash
Copiar código
npm run start:dev
El servidor quedará disponible en:

arduino
Copiar código
http://localhost:3000
 Roles del Sistema
Rol	Descripción	Permisos principales
Administrador (1)	Control total del sistema	CRUD completo
Operador (2)	Registra y consulta datos propios	Ver y reportar unidades asignadas
Encargado de Flotilla (4)	Gestiona unidades de su proveedor	Crear/editar unidades y combustible
Proveedor (3)	Información de terceros	Visualización limitada

🧠 Módulos Implementados
🔹 Usuarios
Registro y gestión de roles.

Integración con Firebase Auth.

Validación de permisos por token.

🔹 Unidades
Registro de camiones y maquinaria.

Validación según rol:

Solo administradores o encargados pueden crear.

Operadores solo pueden ver sus unidades.

🔹 Combustible
Registro de consumo de combustible.

Validación por operador/unidad.

Cálculo automático de costos totales.

🔹 Proveedores
Administración de proveedores y contratos.

 Comandos útiles
Acción	Comando
Ejecutar en modo desarrollo	npm run start:dev
Compilar a producción	npm run build
Ejecutar Prisma Studio	npx prisma studio
Ejecutar pruebas	npm run test
Regenerar cliente Prisma	npx prisma generate

🧾 Licencia
Proyecto desarrollado como parte del Proyecto de Graduación
Universidad Mariano Gálvez de Guatemala – Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación

© 2025 - Axel Hernández y equipo de desarrollo CapiTrack.

📬 Contacto
Autor: Axel Hernández
Correo: haxel1201@gmail.com
GitHub: @axelhernandezgt