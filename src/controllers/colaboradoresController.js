import { db } from '../../personal/db.js'; // Importar el pool de conexiones correctamente
import { validateUser } from '../../validators/user.js'; // Importar el validador correctamente

const getAllColaboradores = (req, res) => {
  const query = 'SELECT * FROM ferreimp_colaboradores';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      return;
    }
    console.log('Resultados enviados:', results);
    res.json(results);
  });
};

const createColaborador = (req, res) => {
  const validationResult = validateUser(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(e => e.message);
    return res.status(400).json({ errors });
  }

  const { nombre, apellido, cedula, cargo } = req.body;
  const query = 'INSERT INTO ferreimp_colaboradores (nombre, apellido, cedula, cargo) VALUES (?, ?, ?, ?)';

  db.query(query, [nombre, apellido, cedula, cargo], (err, results) => {
    if (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).json({ error: 'Error en la consulta a la base de datos' });
      return;
    }
    res.status(201).json({ message: 'Colaborador creado exitosamente', results });
  });
};

export {
  getAllColaboradores,
  createColaborador
};