import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

// Crear un pool de conexiones
const db = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

export { db };

export const getIds = async () =>{
    try{
        const [rows] = await db.query('SELECT * FROM reused_ids');
        console.log(rows)
    }catch (error) {
        console.error('Error al obtener el ID', error);
    }
}

export const getUsers = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM usuarios');
        console.log(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }
};

getIds ();
getUsers();
