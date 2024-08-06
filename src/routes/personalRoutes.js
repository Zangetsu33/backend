import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js'
import { generateToken } from './middlewares/generatorToken.js';
import {db} from '../personal/db.js'; // Importar el pool de conexiones correctamente


const router = Router();

// Definir la ruta para ver la disponibilidad de Id
router.get('/available-ids', async (req, res) => {
    try {
        const results = await getIds();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener ids disponibles:', err);
        res.status(500).json({ error: 'Error al obtener los ids disponibles' });
    }
});

// Definir la ruta para ver la disponibilidad de usuarios
router.get('/available-users', async (req, res) => {
    try {
        const results = await getUsers();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error obteniendo usuarios disponibles:', err);
        res.status(500).json({ error: 'Error al obtener los usuarios disponibles' });
    }
});

// Definir la ruta para obtener datos
router.get('/db', authMiddleware, async (req, res) => {
    try {
        // Ejecutar la consulta usando el pool de conexiones
        const [results] = await db.query('SELECT * FROM db');
        console.log('Resultados enviados:', results);
        res.json(results); // Enviar los resultados como JSON
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Definir la ruta para obtener datos por ID
router.get('/db/id/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.query('SELECT * FROM db WHERE id = ?', [id]);

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'No se encontró el registro con el ID proporcionado' });
        }
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Definir la ruta para obtener datos por cédula
router.get('/db/cedula/:cedula', async (req, res) => {
    const { cedula } = req.params;

    try {
        // Ejecutar la consulta usando el pool de conexiones
        const [results] = await db.query('SELECT * FROM db WHERE cedula = ?', [cedula]);

        if (results.length > 0) {
            console.log('Resultado enviado:', results[0]);
            res.json(results[0]); // Enviar el resultado como JSON
        } else {
            res.status(404).json({ error: 'No se encontró el registro con la cédula proporcionada' });
        }
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Definir la ruta para obtener datos por nombre
router.get('/db/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params; // Obtener el parámetro nombre de la URL

    try {
        // Ejecutar la consulta usando el pool de conexiones
        const [results] = await db.query('SELECT * FROM db WHERE nombre_completo LIKE ?', [`%${nombre}%`]);

        if (results.length > 0) {
            console.log('Resultado enviado:', results);
            res.json(results); // Enviar los resultados como JSON
        } else {
            res.status(404).json({ error: 'No se encontró el registro con el nombre proporcionado' });
        }
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Definir la ruta para obtener datos por apellido
router.get('/db/apellido_completo/:apellido', async (req, res) => {
    const { apellido } = req.params;

    try {
        // Usar LIKE con comodines para buscar el apellido completo
        const [results] = await db.query('SELECT * FROM db WHERE apellido_completo LIKE ?', [`%${apellido}%`]);

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: 'No se encontró el registro con el apellido proporcionado' });
        }
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Definir la ruta para obtener datos por cargo
router.get('/db/cargo/:cargo', async (req, res) => {
    const { cargo } = req.params;

    console.log('Cargo recibido:', cargo); // Depuración

    try {
        // Verifica si el valor de cargo es uno de los valores permitidos
        const validCargos = ['ejecutivo', 'gerente'];
        if (!validCargos.some(validCargo => cargo.toLowerCase().includes(validCargo))) {
            return res.status(400).json({ error: 'Cargo inválido. Los cargos válidos son: ejecutivo, gerente.' });
        }

        // Consulta SQL usando LIKE para buscar registros que contengan las palabras clave
        const [results] = await db.query('SELECT * FROM db WHERE cargo LIKE ?', [`%${cargo}%`]);

        console.log('Resultados:', results); // Depuración

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: 'No se encontró el registro con el cargo proporcionado' });
        }
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});


// Definir la ruta para agregar un nuevo registro
router.post('/db', async (req, res) => {
    const { id, cedula, nombre_completo, apellido_completo, cargo } = req.body;

    console.log('Datos recibidos:', req.body); // Depuración

    try {
        // Verificar que todos los campos estén presentes
        if (!id || !cedula || !nombre_completo || !apellido_completo || !cargo) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios: id, cedula, nombre_completo, apellido_completo, cargo.' });
        }

        // Verificar si el id ya existe en la base de datos
        const [existingId] = await db.query('SELECT id FROM db WHERE id = ?', [id]);

        if (existingId.length > 0) {
            return res.status(409).json({ error: 'ID existente. Por favor, elige otro ID.' });
        }

        // Consulta SQL para insertar un nuevo registro
        const [result] = await db.query(
            'INSERT INTO db (id, cedula, nombre_completo, apellido_completo, cargo) VALUES (?, ?, ?, ?, ?)',
            [id, cedula, nombre_completo, apellido_completo, cargo]
        );

        console.log('Registro insertado:', result); // Depuración

        // Responder con el nuevo registro insertado
        res.status(201).json({ message: 'Registro agregado con éxito', insertId: result.insertId });
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});
// Definir la ruta para eliminar un registro
router.delete('/db/cedula/:cedula', async (req, res) => {
    const { cedula } = req.params;

    try {
        // Consulta SQL para verificar si existe un registro con la cédula proporcionada
        const checkQuery = 'SELECT id, cargo FROM db WHERE cedula = ?';
        const [results] = await db.query(checkQuery, [cedula]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontró el registro con la cédula proporcionada' });
        }

        const { id, cargo } = results[0];

        // Actualizar la tabla reused_ids.sql con el id y cargo antes de eliminar de db.sql
        const storeQuery = `
            INSERT INTO reused_ids (id, cargo) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE cargo = VALUES(cargo)
        `;
        await db.query(storeQuery, [id, cargo]);

        // Eliminar el registro de la tabla db.sql
        const deleteQuery = 'DELETE FROM db WHERE id = ?';
        const [deleteResult] = await db.query(deleteQuery, [id]);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ error: 'No se pudo eliminar el registro de la tabla db' });
        }

        res.status(200).json({ message: 'Registro eliminado de db.sql y id, cargo almacenados en reused_ids.sql' });
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Definir la ruta para actualizar un registro
router.put('/db/id/:id', async (req, res) => {
    const { id } = req.params;
    const { cedula, nombre_completo, apellido_completo } = req.body;

    try {
        const findAvailableIdQuery = 'SELECT id, cargo FROM reused_ids WHERE id = ? LIMIT 1';
        const [availableIdResult] = await db.query(findAvailableIdQuery, [id]);

        if (availableIdResult.length === 0) {
            return res.status(404).json({ error: 'No se encontró un id disponible en la tabla reused_ids' });
        }

        const { id: availableId, cargo } = availableIdResult[0];

        const updateUserQuery = `
            UPDATE usuarios
            SET id = ?, cargo = ?
            WHERE cedula = ? AND nombre_completo = ? AND apellido_completo = ?
        `;
        const [updateUserResult] = await db.query(updateUserQuery, [availableId, cargo, cedula, nombre_completo, apellido_completo]);

        if (updateUserResult.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró un usuario con los datos proporcionados en la tabla usuarios' });
        }

        const updateDbQuery = `
            UPDATE db
            SET 
                cedula = COALESCE(?, cedula), 
                nombre_completo = COALESCE(?, nombre_completo), 
                apellido_completo = COALESCE(?, apellido_completo),
                id = ?, 
                cargo = ?
            WHERE id = ?
        `;
        const [updateDbResult] = await db.query(updateDbQuery, [cedula, nombre_completo, apellido_completo, availableId, cargo, id]);

        if (updateDbResult.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró el registro con el id proporcionado en la tabla db' });
        }

        const deleteFromReusedIdsQuery = 'DELETE FROM reused_ids WHERE id = ?';
        await db.query(deleteFromReusedIdsQuery, [availableId]);

        const deleteFromUsuariosQuery = 'DELETE FROM usuarios WHERE id = ?';
        await db.query(deleteFromUsuariosQuery, [availableId]);

        res.status(200).json({ message: 'Registro actualizado con éxito y id asignado al usuario, datos transferidos a la base de datos db.sql' });
    } catch (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

// Ruta para generar un nuevo token (puede ser una ruta de inicio de sesión o similar)
router.post('/token', (req, res) => {
    const { userId } = req.body; // Asegúrate de que estás recibiendo userId en el cuerpo de la solicitud

    if (!userId) {
        return res.status(400).json({ message: 'userId es necesario para generar el token.' });
    }

    const token = generateToken(userId);
    res.json({ token });
});

export default router;