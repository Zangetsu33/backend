import dotenv from 'dotenv'; 
import express from 'express';
import path from 'node:path';
import { createPool } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { pool } from './src/personal/db.js';



// Obtener la ruta absoluta al archivo .env usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

// Cargar las variables de entorno desde el archivo .env
dotenv.config({ path: envPath });

// Crear un pool de conexiones con las configuraciones de la base de datos
const db = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Crear la aplicación Express
const app = express();
app.disable('x-powered-by');
app.use(express.json()); // Usar express.json() para el cuerpo de la solicitud

// RUTA DE RECUPERACION DE DATOS GENERAL
app.get('/personal/db', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM db');
        console.log('Solicitud GET a /personal/db:');
        console.log(results); // Mostrar la respuesta en la consola
        res.json(results);
    } catch (err) {
        console.error('Error al realizar la consulta a la base de datos:', err);
        res.status(500).send('Error al realizar la consulta a la base de datos');
    }
});

// RUTA DE RECUPERACION DE DATOS POR ID
app.use('/personal/db/id/:id', async (req, res) => {
    try {
        const id = req.params.id; // Extraer el id de los parámetros de la URL
        
        // Realizar la consulta en la base de datos
        const [results] = await db.query('SELECT * FROM db WHERE id = ?', [id]);
        
        console.log(`Solicitud GET a /personal/db/id/${id}:`);
        console.log(results); // Mostrar la respuesta en la consola
        
        // Manejar la respuesta
        if (results.length === 0) {
            res.status(404).send('No se encontró un registro con ese ID');
        } else {
            res.json(results[0]); // Enviar el registro encontrado como respuesta JSON
        }
    } catch (err) {
        console.error('Error al realizar la consulta a la base de datos:', err);
        res.status(500).send('Error al realizar la consulta a la base de datos');
    }
});

// RUTA RECUPERACION DE DATOS POR CEDULA
app.get('/personal/db/cedula/:cedula', async (req, res) => {
    try {
        const { cedula } = req.params;

        // Validar que el parámetro 'cedula' esté presente y no esté vacío
        if (!cedula || cedula.trim() === '') {
            return res.status(400).json({ error: 'Parámetro "cedula" es requerido y no puede estar vacío' });
        }

        // Consulta SQL para buscar registros por cedula
        const query = 'SELECT * FROM db WHERE cedula = ?';
        const [results] = await db.query(query, [cedula]);

        // Mostrar los resultados en la consola (opcional)
        console.log(`Solicitud GET a /personal/db/cedula/${cedula}:`);
        console.log(results);

        if (results.length === 0) {
            // Si no se encuentran datos con la cédula proporcionada
            return res.status(404).json({ message: 'No se encontraron registros con la cédula proporcionada' });
        }

        // Enviar los resultados como JSON
        res.json(results);
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// RECUPERACION DE DATOS POR NOMBRE COMPLETO
app.get('/personal/db/nombre/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;

        // Validar que el parámetro 'nombre' esté presente y no esté vacío
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'Parámetro "nombre" es requerido y no puede estar vacío' });
        }

        console.log('Buscando registros con el nombre:', nombre);

        // Crear patrones de búsqueda para la consulta SQL
        const likePatternInicio = `${nombre}%`; // Para primer nombre
        const likePatternMedio = `% ${nombre}%`; // Para segundo nombre

        console.log('Patrón LIKE para primer nombre:', likePatternInicio);
        console.log('Patrón LIKE para segundo nombre:', likePatternMedio);

        // Consulta SQL para buscar registros por primer o segundo nombre dentro de `nombre_completo`
        const query = `
            SELECT * FROM db
            WHERE nombre_completo LIKE ?
            OR nombre_completo LIKE ?
        `;

        // Ejecutar la consulta SQL con los patrones proporcionados
        const [results] = await db.query(query, [likePatternInicio, likePatternMedio]);

        console.log('Resultados de la consulta:', results);

        if (results.length === 0) {
            // Si no se encuentran datos con el nombre proporcionado
            console.log(`No se encontraron registros con el nombre "${nombre}"`);
            return res.status(404).json({ message: `No se encontraron registros con el nombre "${nombre}"` });
        }

        // Enviar los resultados como JSON
        res.json(results);
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// RECUPERACION DE DATOS POR EL APELLIDO COMPLETO
app.get('/personal/db/apellido_completo/:apellido', async (req, res) => {
    const { apellido } = req.params;

    // Validar que el parámetro 'apellido' esté presente y no esté vacío
    if (!apellido || apellido.trim() === '') {
        return res.status(400).json({ error: 'Parámetro "apellido" es requerido y no debe estar vacío.' });
    }

    try {
        // Consulta SQL para buscar por apellido_completo
        const [rows] = await pool.query(
            `SELECT * FROM db 
            WHERE apellido_completo LIKE CONCAT('%', ?, '%')`,
            [apellido.trim()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados' });
        }

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en la consulta' });
    }
});







// Iniciar el servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});