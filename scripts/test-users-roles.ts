// test-users-roles.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/usuarios'; // Cambia si tu puerto es diferente

// Tokens de prueba (ya los obtuviste con tu token.html)
const adminToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMjEzMGZlZjAyNTg3ZmQ4ODYxODg2OTgyMjczNGVmNzZhMTExNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQXhlbCBIZXJuYW5kZXoiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FwaXRyYWNrLTk0YzBiIiwiYXVkIjoiY2FwaXRyYWNrLTk0YzBiIiwiYXV0aF90aW1lIjoxNzYwODk3MTIyLCJ1c2VyX2lkIjoidVpHTFUwQXFPaGg5cUY1VXJHUGsycXYwVWhSMiIsInN1YiI6InVaR0xVMEFxT2hoOXFGNVVyR1BrMnF2MFVoUjIiLCJpYXQiOjE3NjA4OTcxMjIsImV4cCI6MTc2MDkwMDcyMiwiZW1haWwiOiJoYXhlbDEyMDFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImhheGVsMTIwMUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.AStUwuQ34ORFgyssIFiw9wnRG4fy5r14bAYDbTk10h6WwwBhM9ipYNM0ote02FmoaAyODtda8UqKKm-MEAiFzLyUIXiBxntgp74dE4-A-XABC8pGL9x2xr9r__DJpYH9jUYGZOgnw-bA6v619TBCAYXzmy__ENq8ZUBDkbmwaBZCJUbvx9xbGJTfkvqa9wgFOkbjA_UmNHmGYgl94J8X6ZLc6ahIGgHjsuIKpDSATSqPr4FEb-ipX7XORpfiLL0UnLv6uZS6BJ2p3_2sqkgaTiQSLgBSdjnYjzuGcVyFg12eVaFPiJ4MEuksEMk6w9PGq_na8ijGWotKOSnvu76z0A';
const operadorToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMjEzMGZlZjAyNTg3ZmQ4ODYxODg2OTgyMjczNGVmNzZhMTExNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiT3BlcmFkb3IiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FwaXRyYWNrLTk0YzBiIiwiYXVkIjoiY2FwaXRyYWNrLTk0YzBiIiwiYXV0aF90aW1lIjoxNzYwODk3NTc0LCJ1c2VyX2lkIjoiZWpOWjh1SnFpVVdUcTlZYVA4Qk9UUDA0VXlXMiIsInN1YiI6ImVqTlo4dUpxaVVXVHE5WWFQOEJPVFAwNFV5VzIiLCJpYXQiOjE3NjA4OTc1NzQsImV4cCI6MTc2MDkwMTE3NCwiZW1haWwiOiJwcnVlYmEyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJwcnVlYmEyQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.YLLZ8ksDq0CTKmk0iNKWms1YNz0JAOSwzqYHh41fveGgyuJYZsDF_MPqkAaBphy0hC8P0d94JKLi9AKIxu8mmAR6vFXFHRnRp2CRIeeME_4rO7L4ZQ2bvGK6ZGPxYLdtvBN2FoTPJpIOV_C2v4czoNlWVFiSutqTkELznnCi8h68AxY2jISGHd9R0Z4JDG88IMX5Avz7qFEWJ607RhePGgl3zUNzYGxbWhs05hC4KAKyh7UjF28EWztxn4UQa9a8kSWVsCz6n3K6rveELol3Vho6noct_e-TOUeJ7i5v9INSQq7q83v0y6bX0-haI7ul_DKsBq00sUwNVdIC8tmQsw';

// Usuarios de prueba para crear
const testUsers = [
  { nombre: 'UsuarioPrueba1', correo: 'prueba1@test.com', password: '123456', rol_id: 2 },
  { nombre: 'UsuarioPrueba2', correo: 'prueba2@test.com', password: '123456', rol_id: 2 },
];

async function testRole(token: string, roleName: string) {
  console.log(`\n=== Probando acciones con rol: ${roleName} ===`);

  // Configuración de headers con token
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 1️⃣ Intentar crear un usuario
  try {
    const response = await axios.post(API_URL, testUsers[0], config);
    console.log(`Crear usuario: ✅ Permitido - ID: ${response.data.usuario_id}`);
  } catch (err: any) {
    console.log(`Crear usuario: ❌ Bloqueado - ${err.response?.data?.message || err.message}`);
  }

  // 2️⃣ Intentar obtener lista de usuarios
  try {
    const response = await axios.get(API_URL, config);
    console.log(`Obtener usuarios: ✅ Permitido - Cantidad: ${response.data.length}`);
  } catch (err: any) {
    console.log(`Obtener usuarios: ❌ Bloqueado - ${err.response?.data?.message || err.message}`);
  }

  // 3️⃣ Intentar eliminar un usuario (ID 1 de prueba)
  try {
    const response = await axios.delete(`${API_URL}/1`, config);
    console.log(`Eliminar usuario: ✅ Permitido`);
  } catch (err: any) {
    console.log(`Eliminar usuario: ❌ Bloqueado - ${err.response?.data?.message || err.message}`);
  }

  // 4️⃣ Obtener perfil propio
  try {
    const response = await axios.get(`${API_URL}/profile/me`, config);
    console.log(`Perfil propio: ✅ Permitido - ${response.data.nombre} (${response.data.rol_id})`);
  } catch (err: any) {
    console.log(`Perfil propio: ❌ Bloqueado - ${err.response?.data?.message || err.message}`);
  }
}

async function main() {
  await testRole(adminToken, 'Administrador');
  await testRole(operadorToken, 'Operador');
}

main();
