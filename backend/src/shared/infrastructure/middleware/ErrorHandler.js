class ErrorHandler {
    static handle() {
        return (error, req, res, next) => {
            console.error("Error:", error);

            // Error de validación
            if (error.isJoi) {
                return res.status(400).json({
                    error: error.details[0].message
                });
            }

            // Errores de autenticación
            if (error.message.includes("Token") || error.message.includes("No autorizado")) {
                return res.status(401).json({
                    error: error.message
                });
            }

            // Error genérico
            res.status(500).json({
                error: process.env.NODE_ENV === "production" 
                    ? "Error interno del servidor" 
                    : error.message
            });
        };
    }

    static notFound() {
        return (req, res) => {
            res.status(404).json({
                error: `Ruta ${req.method} ${req.path} no encontrada`
            });
        };
    }
}

module.exports = ErrorHandler;

