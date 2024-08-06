const loggerMiddleware = (req, res, next) => {
    console.log(`Solicitud: ${req.method} ${req.url}`);
    next(); // Pasar al siguiente middleware o ruta
};

export default loggerMiddleware;