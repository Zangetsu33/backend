import morgan from 'morgan';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuración para el archivo de log
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logStream = createWriteStream(join(__dirname, '..', 'access.log'), { flags: 'a' });

// Middleware para registrar las solicitudes con morgan
const morganMiddleware = morgan('combined', { stream: logStream });

export default morganMiddleware;