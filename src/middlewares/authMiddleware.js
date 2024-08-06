import jwt from 'jsonwebtoken';


console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Verifica si la variable de entorno JWT_SECRET está definida
if (!process.env.JWT_SECRET) {
    throw new Error('La variable de entorno JWT_SECRET no está definida.');
}

const authMiddleware = (req, res, next) => {
    // Extrae el token del header Authorization
    const token = req.headers['authorization']?.split(' ')[1];

    // Si no hay token, responde con error 401
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    // Verifica el token usando JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token no válido.' });
        }
        // Agrega el payload decodificado al objeto de solicitud
        req.user = decoded;
        next();
    });
};

export default authMiddleware;