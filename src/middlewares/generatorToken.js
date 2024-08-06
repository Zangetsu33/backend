import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

// Obtener __dirname para el uso de rutas relativas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Imprimir la ruta completa al archivo .env para verificar
const envPath = path.join(__dirname, '.env');
console.log('Ruta completa al archivo .env:', envPath);

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: envPath });

// Exportar generateToken como exportación predeterminada
export const generateToken = (userId) => {
    const payload = { userId };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };

    return jwt.sign(payload, secret, options);
};
