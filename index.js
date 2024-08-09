import dotenv from 'dotenv'; 
import express from 'express';
import path from 'node:path';
import { createPool } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { pool } from './src/personal/db.js';
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

        // Validar el parámetro 'cedula' usando el esquema de validación
        try {
            validateUser.parse({ cedula }); // Solo validamos el campo 'cedula'
        } catch (err) {
            return res.status(400).json({ error: 'Cédula inválida', details: err.errors });
        }

        // Consulta SQL para buscar registros por cedula
        const query = 'SELECT * FROM db WHERE cedula = ?';
        const [results] = await db.query(query, [cedula]);

        // Mostrar los resultados en la consola (opcional)
        console.log(`Solicitud GET a /personal/db/cedula/${cedula}:`);
        console.log(results);

        if (results.length === 0) {
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

        // Validar el parámetro 'nombre' usando el esquema de validación
        try {
            validatePartialUser.parse({ nombre_completo: nombre }); // Usamos el campo 'nombre_completo'
        } catch (err) {
            return res.status(400).json({ error: 'Nombre inválido', details: err.errors });
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

    // Validar el parámetro 'apellido' usando el esquema de validación
    try {
        validatePartialUser.parse({ apellido_completo: apellido }); // Usamos el campo 'apellido_completo'
    } catch (err) {
        return res.status(400).json({ error: 'Apellido inválido', details: err.errors });
    }

    // Validar que el parámetro 'apellido' esté presente y no esté vacío
    if (!apellido || apellido.trim() === '') {
        return res.status(400).json({ error: 'Parámetro "apellido" es requerido y no debe estar vacío.' });
    }

    try {
        // Consulta SQL para buscar por apellido_completo
        const [rows] = await db.query(
            `SELECT * FROM db 
            WHERE apellido_completo LIKE CONCAT('%', ?, '%')`,
            [apellido.trim()]
        );

        console.log('Resultados de la consulta:', rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados' });
        }

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en la consulta' });
    }
});

// RECUPERACION DE DATOS POR EL CARGO
app.get('/personal/db/cargo/:cargo', async (req, res) => {
    const { cargo } = req.params;
    const normalizedCargo = cargo.trim().toLowerCase();

    // Definir la consulta SQL para buscar registros que contengan "gerente" o "ejecutivo" en el cargo
    const query = `
        SELECT * FROM db
        WHERE LOWER(TRIM(cargo)) LIKE ?
    `;

    let searchTerm = '';

    if (normalizedCargo === 'gerente') {
        searchTerm = '%gerente%';
    } else if (normalizedCargo === 'ejecutivo') {
        searchTerm = '%ejecutivo%';
    } else {
        return res.status(400).json({ error: 'El cargo debe ser "gerente" o "ejecutivo"' });
    }

    try {
        // Ejecutar la consulta a la base de datos
        const [results] = await db.query(query, [searchTerm]);

        // Imprimir los resultados en la consola
        console.log('Resultados de la consulta:', results);

        // Si no se encontraron resultados, responder con un mensaje adecuado
        if (results.length === 0) {
            console.log('No se encontraron registros con el cargo especificado');
            return res.status(404).json({ message: 'No se encontraron registros con el cargo especificado' });
        }

        // Enviar los resultados como JSON
        res.json(results);
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// CREACION DE UN NUEVO REGISTRO
app.post('/personal/db/create', (req, res) => {
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

    // Insertar nuevo registro en la base de datos
    const insertQuery = 'INSERT INTO db (id, cedula, nombre_completo, apellido_completo, cargo) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [id, cedula, nombre_completo, apellido_completo, cargo], (err, results) => {
        if (err) {
            console.error('Error insertando el registro:', err);
            return res.status(500).json({ error: 'Error insertando el registro en la base de datos' });
        }

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
            id: results.insertId,
            cedula,
            nombre_completo,
            apellido_completo,
            cargo
        });
    });
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

/





// Iniciar el servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});