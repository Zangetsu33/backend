import dotenv from 'dotenv'; 
import express from 'express';
import path from 'node:path';
import { createPool } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { validateUser, validatePartialUser } from './user.js';



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
        const { id, cedula, nombre, apellido, cargo } = req.query;
        let query = 'SELECT id, cedula, nombre_completo AS nombre, apellido_completo AS apellido, cargo FROM db';
        let params = [];
        let conditions = [];

        if (id) {
            conditions.push('id = ?');
            params.push(id);
        }
        if (cedula) {
            conditions.push('cedula = ?');
            params.push(cedula);
        }
        if (nombre) {
            conditions.push('nombre_completo LIKE ?');
            params.push(`%${nombre}%`);
        }
        if (apellido) {
            conditions.push('apellido_completo LIKE ?');
            params.push(`%${apellido}%`);
        }
        if (cargo) {
            conditions.push('cargo = ?');
            params.push(cargo);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        const [results] = await db.query(query, params);

        // Imprimir los resultados en la terminal y consola
        console.log('Resultados de la consulta:', results);

        if (results.length === 0) {
            res.status(404).send('No se encontraron registros con los parámetros proporcionados');
        } else {
            res.json(results);
        }
    } catch (err) {
        console.error('Error al realizar la consulta a la base de datos:', err);
        res.status(500).send('Error al realizar la consulta a la base de datos');
    }
});

// CREACION DE UN NUEVO REGISTRO
app.post('/personal/db/create', async (req, res) => {
    const { id, cedula, nombre_completo, apellido_completo, cargo } = req.body;

    console.log('Datos recibidos:', { id, cedula, nombre_completo, apellido_completo, cargo });

    // Validar que todos los campos obligatorios estén presentes
    if (!id || !cedula || !nombre_completo || !apellido_completo || !cargo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar los tipos de datos esperados
    if (isNaN(id) || isNaN(cedula) || typeof nombre_completo !== 'string' || typeof apellido_completo !== 'string' || typeof cargo !== 'string') {
        return res.status(400).json({ error: 'Tipos de datos incorrectos' });
    }

    try {
        // Verificar si el ID ya existe
        const [checkResults] = await db.query('SELECT * FROM db WHERE id = ?', [id]);

        if (checkResults.length > 0) {
            return res.status(409).json({ error: 'Upss, intenta con uno que esté disponible' });
        }

        // Insertar nuevo registro en la base de datos
        const [insertResult] = await db.query('INSERT INTO db (id, cedula, nombre_completo, apellido_completo, cargo) VALUES (?, ?, ?, ?, ?)', [id, cedula, nombre_completo, apellido_completo, cargo]);

        // Mostrar el nuevo registro en la terminal
        console.log('Nuevo registro creado:');
        console.log({
            id,
            cedula,
            nombre_completo,
            apellido_completo,
            cargo
        });

        // Enviar respuesta exitosa al cliente
        res.status(201).json({
            message: 'Registro creado con éxito',
            id: insertResult.insertId,
            cedula,
            nombre_completo,
            apellido_completo,
            cargo
        });
    } catch (err) {
        console.error('Error al intentar crear el registro:', err);
        res.status(500).json({ error: 'Error en la creación del registro' });
    }
});

// ELIMINACION DE UN REGISTRO SOLO POR EL NOMBRE SIN ELIMINAR EL ID Y EL CARGO
app.delete('/personal/db/cedula/:cedula', async (req, res) => {
    const { cedula } = req.params;

    console.log('Intentando eliminar el registro con la cédula:', cedula);

    try {
        // Paso 1: Consultar el registro para verificar el ID y el cargo
        const [record] = await db.query('SELECT id, cargo FROM db WHERE cedula = ?', [cedula]);

        // Verificar si se encontró el registro
        if (record.length === 0) {
            console.log('No se encontraron registros con la cédula especificada');
            return res.status(404).json({ message: 'No se encontraron registros con la cédula especificada' });
        }

        // Obtener el registro encontrado
        const { id, cargo } = record[0];

        // Paso 2: Eliminar el registro de la tabla principal
        const [deleteResult] = await db.query('DELETE FROM db WHERE cedula = ?', [cedula]);

        // Verificar si se eliminó algún registro
        if (deleteResult.affectedRows === 0) {
            console.log('No se pudo eliminar el registro con la cédula especificada');
            return res.status(404).json({ message: 'No se pudo eliminar el registro con la cédula especificada' });
        }

        // Paso 3: Actualizar el registro en la misma tabla si el ID o el cargo están vacíos
        if (!id || !cargo) {
            await db.query('INSERT INTO db (id, cargo) VALUES (?, ?)', [id || null, cargo || null]);
            console.log('Datos vacíos almacenados en la misma tabla db');
        }

        console.log('Registro eliminado correctamente');
        res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (err) {
        console.error('Error al intentar eliminar el registro:', err);
        res.status(500).json({ error: 'Error en la eliminación del registro' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});