import dotenv from 'dotenv'; 
dotenv.config();
import express from 'express';
import path from 'node:path';
import { createPool } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import loggerMiddleware from './src/middlewares/loggerMiddleware.js';
import authMiddleware from './src/middlewares/authMiddleware.js';
import morganMiddleware from './src/middlewares/morganMiddleware.js';
import errorMiddleware from './src/middlewares/errorMiddleware.js';
import personalRoutes from './src/routes/personalRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


 
console.log('JWT_SECRET:', process.env.JWT_SECRET);// Cargar las variables de entorno desde un archivo .env
// Crear un pool de conexiones con las configuraciones de la base de datos
const db = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Crear la aplicación Express
const app = express();
app.disable('x-powered-by');
app.use(express.json()); // Usar express.json() para el cuerpo de la solicitud

// Middleware de morgan para registrar las solicitudes
app.use(morganMiddleware);

// Aplicar middleware de autenticación y luego las rutas
app.use('/personal', authMiddleware, personalRoutes);

// Middleware de registro
app.use(loggerMiddleware);

// Middleware de manejo de errores
app.use(errorMiddleware);

// Iniciar el servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});