import db from '../db.js'; // Asegúrate de tener configurada tu conexión a la base de datos

export const getPersonalData = async (req, res) => {
    try {
        const { id, cedula, nombre, apellido, cargo } = req.query;
        let query = 'SELECT id, cedula, nombre, apellido, cargo FROM db WHERE ';
        let params = [];

        if (id) {
            query += 'id = ?';
            params.push(id);
        } else if (cedula) {
            query += 'cedula = ?';
            params.push(cedula);
        } else if (nombre) {
            query += 'nombre = ?';
            params.push(nombre);
        } else if (apellido) {
            query += 'apellido = ?';
            params.push(apellido);
        } else if (cargo) {
            query += 'cargo = ?';
            params.push(cargo);
        } else {
            return res.status(400).send('Debe proporcionar al menos un parámetro de búsqueda');
        }

        const [results] = await db.query(query, params);

        if (results.length === 0) {
            res.status(404).send('No se encontraron registros con los parámetros proporcionados');
        } else {
            res.json(results);
        }
    } catch (err) {
        console.error('Error al realizar la consulta a la base de datos:', err);
        res.status(500).send('Error al realizar la consulta a la base de datos');
    }
};
