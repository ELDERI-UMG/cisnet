const jwt = require("jsonwebtoken");

class AuthMiddleware {
    static authenticate() {
        return (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return res.status(401).json({
                        error: "Token de acceso requerido"
                    });
                }

                const token = authHeader.substring(7);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
                next();
            } catch (error) {
                return res.status(401).json({
                    error: "Token inválido"
                });
            }
        };
    }
}

module.exports = AuthMiddleware;

