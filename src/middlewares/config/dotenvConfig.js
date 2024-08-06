import path from 'node:path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Obtener __dirname y __filename usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar el archivo .env desde la ruta correcta
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('Ruta completa al archivo .env:', envPath);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Verifica si la variable de entorno JWT_SECRET está definida
if (!process.env.JWT_SECRET) {
    throw new Error('La variable de entorno JWT_SECRET no está definida.');
}